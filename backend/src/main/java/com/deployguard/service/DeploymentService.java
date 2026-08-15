package com.deployguard.service;

import com.deployguard.dto.DeploymentRequest;
import com.deployguard.dto.DeploymentResponse;
import com.deployguard.dto.DeploymentStageResponse;
import com.deployguard.entity.*;
import com.deployguard.exception.InvalidDeploymentOperationException;
import com.deployguard.exception.ResourceNotFoundException;
import com.deployguard.repository.ApplicationRepository;
import com.deployguard.repository.DeploymentRepository;
import com.deployguard.repository.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Business logic for creating, tracking, and rolling back deployments.
 *
 * NOTE: This phase of the project does not talk to any real infrastructure
 * (no Kubernetes, no CI system). Instead, a deployment pipeline is *simulated*
 * synchronously: a fixed set of stages is created and stepped through, each
 * with a start/end time, so that the frontend has realistic data to render.
 */
@Service
@RequiredArgsConstructor
public class DeploymentService {

    private static final List<String> PIPELINE_STAGES = List.of(
            "Queued", "Build", "Test", "Security Scan", "Image Build", "Deployment", "Health Check"
    );

    private final DeploymentRepository deploymentRepository;
    private final ApplicationRepository applicationRepository;
    private final EnvironmentRepository environmentRepository;
    private final Random random = new Random();

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getAllDeployments() {
        return deploymentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeploymentResponse getDeploymentById(Long id) {
        return toResponse(findDeploymentOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByApplication(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id " + applicationId);
        }
        return deploymentRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByEnvironment(Long environmentId) {
        if (!environmentRepository.existsById(environmentId)) {
            throw new ResourceNotFoundException("Environment not found with id " + environmentId);
        }
        return deploymentRepository.findByEnvironmentIdOrderByCreatedAtDesc(environmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Starts a new deployment. The pipeline is simulated synchronously so that,
     * by the time this call returns, the deployment already has a final status
     * (SUCCESS or FAILED) with fully populated stage timing data.
     */
    @Transactional
    public DeploymentResponse startDeployment(DeploymentRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id " + request.getApplicationId()));

        Environment environment = environmentRepository.findById(request.getEnvironmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with id " + request.getEnvironmentId()));

        Deployment deployment = Deployment.builder()
                .application(application)
                .environment(environment)
                .version(request.getVersion())
                .branch(request.getBranch() != null && !request.getBranch().isBlank()
                        ? request.getBranch() : application.getGitBranch())
                .commitSha(request.getCommitSha())
                .deploymentMessage(request.getDeploymentMessage())
                .status(DeploymentStatus.QUEUED)
                .build();

        Deployment saved = deploymentRepository.save(deployment);

        runSimulatedPipeline(saved);

        if (saved.getStatus() == DeploymentStatus.SUCCESS) {
            application.setCurrentVersion(saved.getVersion());
            applicationRepository.save(application);
        }

        Deployment finalDeployment = deploymentRepository.save(saved);
        return toResponse(finalDeployment);
    }

    @Transactional
    public DeploymentResponse updateDeploymentStatus(Long id, DeploymentStatus newStatus) {
        Deployment deployment = findDeploymentOrThrow(id);
        deployment.setStatus(newStatus);
        if (newStatus == DeploymentStatus.RUNNING && deployment.getStartedAt() == null) {
            deployment.setStartedAt(LocalDateTime.now());
        }
        if (isTerminal(newStatus) && deployment.getCompletedAt() == null) {
            deployment.setCompletedAt(LocalDateTime.now());
        }
        return toResponse(deploymentRepository.save(deployment));
    }

    /**
     * Rolls back a deployment by re-deploying the last known successful version
     * for the same application + environment, and marking the target deployment
     * as ROLLED_BACK.
     */
    @Transactional
    public DeploymentResponse rollbackDeployment(Long id) {
        Deployment deployment = findDeploymentOrThrow(id);

        if (deployment.getStatus() != DeploymentStatus.SUCCESS && deployment.getStatus() != DeploymentStatus.FAILED) {
            throw new InvalidDeploymentOperationException(
                    "Only completed deployments (SUCCESS or FAILED) can be rolled back");
        }

        Optional<Deployment> previousSuccess = deploymentRepository
                .findByApplicationIdOrderByCreatedAtDesc(deployment.getApplication().getId())
                .stream()
                .filter(d -> d.getStatus() == DeploymentStatus.SUCCESS)
                .filter(d -> d.getEnvironment().getId().equals(deployment.getEnvironment().getId()))
                .filter(d -> !d.getId().equals(deployment.getId()))
                .findFirst();

        if (previousSuccess.isEmpty()) {
            throw new InvalidDeploymentOperationException(
                    "No previous successful deployment found to roll back to for this application and environment");
        }

        Deployment target = previousSuccess.get();

        Deployment rollbackDeployment = Deployment.builder()
                .application(deployment.getApplication())
                .environment(deployment.getEnvironment())
                .version(target.getVersion())
                .branch(target.getBranch())
                .commitSha(target.getCommitSha())
                .deploymentMessage("Rollback to version " + target.getVersion())
                .status(DeploymentStatus.QUEUED)
                .build();

        Deployment savedRollback = deploymentRepository.save(rollbackDeployment);
        runSimulatedPipeline(savedRollback);
        savedRollback.setStatus(DeploymentStatus.SUCCESS);
        deploymentRepository.save(savedRollback);

        deployment.setStatus(DeploymentStatus.ROLLED_BACK);
        deploymentRepository.save(deployment);

        deployment.getApplication().setCurrentVersion(target.getVersion());
        applicationRepository.save(deployment.getApplication());

        return toResponse(savedRollback);
    }

    /**
     * Simulates running a deployment through a fixed pipeline of stages.
     * Every stage is marked SUCCESS except the outcome of the whole deployment,
     * which has a small random chance of failing at the final "Health Check" stage
     * to keep the demo data realistic.
     */
    private void runSimulatedPipeline(Deployment deployment) {
        LocalDateTime cursor = LocalDateTime.now();
        deployment.setStartedAt(cursor);
        deployment.setStatus(DeploymentStatus.RUNNING);

        boolean willFail = random.nextInt(100) < 12; // ~12% simulated failure rate
        int failAtIndex = willFail ? PIPELINE_STAGES.size() - 1 : -1;

        for (int i = 0; i < PIPELINE_STAGES.size(); i++) {
            String stageName = PIPELINE_STAGES.get(i);
            LocalDateTime stageStart = cursor;
            LocalDateTime stageEnd = stageStart.plusSeconds(5 + random.nextInt(20));
            cursor = stageEnd;

            boolean thisStageFails = (i == failAtIndex);

            DeploymentStage stage = DeploymentStage.builder()
                    .deployment(deployment)
                    .stageName(stageName)
                    .stageOrder(i + 1)
                    .status(thisStageFails ? StageStatus.FAILED : StageStatus.SUCCESS)
                    .startedAt(stageStart)
                    .completedAt(stageEnd)
                    .message(thisStageFails
                            ? stageName + " failed: simulated health check failure"
                            : stageName + " completed successfully")
                    .build();

            deployment.getStages().add(stage);

            if (thisStageFails) {
                break;
            }
        }

        deployment.setCompletedAt(cursor);
        deployment.setStatus(willFail ? DeploymentStatus.FAILED : DeploymentStatus.SUCCESS);
    }

    private boolean isTerminal(DeploymentStatus status) {
        return status == DeploymentStatus.SUCCESS
                || status == DeploymentStatus.FAILED
                || status == DeploymentStatus.ROLLED_BACK;
    }

    private Deployment findDeploymentOrThrow(Long id) {
        return deploymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id " + id));
    }

    private DeploymentResponse toResponse(Deployment deployment) {
        List<DeploymentStageResponse> stageResponses = deployment.getStages().stream()
                .map(stage -> DeploymentStageResponse.builder()
                        .id(stage.getId())
                        .stageName(stage.getStageName())
                        .stageOrder(stage.getStageOrder())
                        .status(stage.getStatus())
                        .startedAt(stage.getStartedAt())
                        .completedAt(stage.getCompletedAt())
                        .durationText(DeploymentStageResponse.computeDurationText(
                                stage.getStartedAt(), stage.getCompletedAt()))
                        .message(stage.getMessage())
                        .build())
                .toList();

        return DeploymentResponse.builder()
                .id(deployment.getId())
                .applicationId(deployment.getApplication().getId())
                .applicationName(deployment.getApplication().getName())
                .environmentId(deployment.getEnvironment().getId())
                .environmentName(deployment.getEnvironment().getName())
                .version(deployment.getVersion())
                .branch(deployment.getBranch())
                .status(deployment.getStatus())
                .startedAt(deployment.getStartedAt())
                .completedAt(deployment.getCompletedAt())
                .commitSha(deployment.getCommitSha())
                .deploymentMessage(deployment.getDeploymentMessage())
                .createdAt(deployment.getCreatedAt())
                .stages(stageResponses)
                .build();
    }
}
