package com.deployguard.service;

import com.deployguard.dto.ApplicationRequest;
import com.deployguard.dto.ApplicationResponse;
import com.deployguard.entity.Application;
import com.deployguard.entity.Environment;
import com.deployguard.exception.DuplicateResourceException;
import com.deployguard.exception.ResourceNotFoundException;
import com.deployguard.repository.ApplicationRepository;
import com.deployguard.repository.DeploymentRepository;
import com.deployguard.repository.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for creating, reading, updating and deleting Applications.
 * Kept separate from the controller layer so HTTP concerns never mix with domain rules.
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final EnvironmentRepository environmentRepository;
    private final DeploymentRepository deploymentRepository;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application application = findApplicationOrThrow(id);
        return toResponse(application);
    }

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request) {
        if (applicationRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("An application named '" + request.getName() + "' already exists");
        }

        Application application = Application.builder()
                .name(request.getName())
                .description(request.getDescription())
                .gitRepositoryUrl(request.getGitRepositoryUrl())
                .gitBranch(request.getGitBranch() != null && !request.getGitBranch().isBlank()
                        ? request.getGitBranch() : "main")
                .environment(resolveEnvironment(request.getEnvironmentName()))
                .currentVersion(request.getCurrentVersion())
                .build();

        Application saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    @Transactional
    public ApplicationResponse updateApplication(Long id, ApplicationRequest request) {
        Application application = findApplicationOrThrow(id);

        if (!application.getName().equalsIgnoreCase(request.getName())
                && applicationRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("An application named '" + request.getName() + "' already exists");
        }

        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setGitRepositoryUrl(request.getGitRepositoryUrl());
        if (request.getGitBranch() != null && !request.getGitBranch().isBlank()) {
            application.setGitBranch(request.getGitBranch());
        }
        application.setEnvironment(resolveEnvironment(request.getEnvironmentName()));
        if (request.getCurrentVersion() != null) {
            application.setCurrentVersion(request.getCurrentVersion());
        }

        Application saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    @Transactional
    public void deleteApplication(Long id) {
        Application application = findApplicationOrThrow(id);
        applicationRepository.delete(application);
    }

    private Environment resolveEnvironment(String environmentName) {
        if (environmentName == null || environmentName.isBlank()) {
            return null;
        }
        return environmentRepository.findByNameIgnoreCase(environmentName)
                .orElseThrow(() -> new ResourceNotFoundException("Environment '" + environmentName + "' not found"));
    }

    private Application findApplicationOrThrow(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
    }

    private ApplicationResponse toResponse(Application application) {
        long totalDeployments = deploymentRepository.findByApplicationIdOrderByCreatedAtDesc(application.getId()).size();
        return ApplicationResponse.builder()
                .id(application.getId())
                .name(application.getName())
                .description(application.getDescription())
                .gitRepositoryUrl(application.getGitRepositoryUrl())
                .gitBranch(application.getGitBranch())
                .environmentName(application.getEnvironment() != null ? application.getEnvironment().getName() : null)
                .currentVersion(application.getCurrentVersion())
                .totalDeployments(totalDeployments)
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
