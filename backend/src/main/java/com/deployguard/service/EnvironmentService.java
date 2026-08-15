package com.deployguard.service;

import com.deployguard.dto.EnvironmentRequest;
import com.deployguard.dto.EnvironmentResponse;
import com.deployguard.entity.Environment;
import com.deployguard.entity.EnvironmentStatus;
import com.deployguard.exception.DuplicateResourceException;
import com.deployguard.exception.ResourceNotFoundException;
import com.deployguard.repository.EnvironmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for managing deployment target environments (Development, Staging, Production, ...).
 */
@Service
@RequiredArgsConstructor
public class EnvironmentService {

    private final EnvironmentRepository environmentRepository;

    @Transactional(readOnly = true)
    public List<EnvironmentResponse> getAllEnvironments() {
        return environmentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EnvironmentResponse getEnvironmentById(Long id) {
        return toResponse(findEnvironmentOrThrow(id));
    }

    @Transactional
    public EnvironmentResponse createEnvironment(EnvironmentRequest request) {
        if (environmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("An environment named '" + request.getName() + "' already exists");
        }
        Environment environment = Environment.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : EnvironmentStatus.ACTIVE)
                .build();
        return toResponse(environmentRepository.save(environment));
    }

    @Transactional
    public EnvironmentResponse updateEnvironment(Long id, EnvironmentRequest request) {
        Environment environment = findEnvironmentOrThrow(id);

        if (!environment.getName().equalsIgnoreCase(request.getName())
                && environmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("An environment named '" + request.getName() + "' already exists");
        }

        environment.setName(request.getName());
        environment.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            environment.setStatus(request.getStatus());
        }
        return toResponse(environmentRepository.save(environment));
    }

    @Transactional
    public void deleteEnvironment(Long id) {
        Environment environment = findEnvironmentOrThrow(id);
        environmentRepository.delete(environment);
    }

    private Environment findEnvironmentOrThrow(Long id) {
        return environmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environment not found with id " + id));
    }

    private EnvironmentResponse toResponse(Environment environment) {
        return EnvironmentResponse.builder()
                .id(environment.getId())
                .name(environment.getName())
                .description(environment.getDescription())
                .status(environment.getStatus())
                .createdAt(environment.getCreatedAt())
                .build();
    }
}
