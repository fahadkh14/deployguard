package com.deployguard.service;

import com.deployguard.dto.DashboardSummaryResponse;
import com.deployguard.dto.DeploymentResponse;
import com.deployguard.entity.Deployment;
import com.deployguard.entity.DeploymentStatus;
import com.deployguard.repository.ApplicationRepository;
import com.deployguard.repository.DeploymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Aggregates data across Applications and Deployments to power the dashboard view.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ApplicationRepository applicationRepository;
    private final DeploymentRepository deploymentRepository;
    private final DeploymentServiceMapper mapper = new DeploymentServiceMapper();

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        long totalApplications = applicationRepository.count();
        long totalDeployments = deploymentRepository.countAllDeployments();
        long successful = deploymentRepository.countByStatus(DeploymentStatus.SUCCESS);
        long failed = deploymentRepository.countByStatus(DeploymentStatus.FAILED);
        long running = deploymentRepository.countByStatus(DeploymentStatus.RUNNING);
        long queued = deploymentRepository.countByStatus(DeploymentStatus.QUEUED);

        double successRate = totalDeployments == 0
                ? 0.0
                : Math.round((successful * 10000.0 / totalDeployments)) / 100.0;

        List<Deployment> recent = deploymentRepository.findTop10ByOrderByCreatedAtDesc();
        List<DeploymentResponse> recentResponses = recent.stream().map(mapper::toResponse).toList();

        return DashboardSummaryResponse.builder()
                .totalApplications(totalApplications)
                .totalDeployments(totalDeployments)
                .successfulDeployments(successful)
                .failedDeployments(failed)
                .runningDeployments(running)
                .queuedDeployments(queued)
                .successRate(successRate)
                .recentDeployments(recentResponses)
                .build();
    }

    /**
     * Small internal mapper so the dashboard summary can reuse deployment -> DTO mapping
     * without creating a circular dependency on DeploymentService.
     */
    private static class DeploymentServiceMapper {
        DeploymentResponse toResponse(Deployment deployment) {
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
                    .stages(List.of())
                    .build();
        }
    }
}
