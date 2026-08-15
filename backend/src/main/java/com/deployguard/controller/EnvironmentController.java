package com.deployguard.controller;

import com.deployguard.dto.DeploymentResponse;
import com.deployguard.dto.EnvironmentRequest;
import com.deployguard.dto.EnvironmentResponse;
import com.deployguard.service.DeploymentService;
import com.deployguard.service.EnvironmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/environments")
@RequiredArgsConstructor
public class EnvironmentController {

    private final EnvironmentService environmentService;
    private final DeploymentService deploymentService;

    @GetMapping
    public ResponseEntity<List<EnvironmentResponse>> getAllEnvironments() {
        return ResponseEntity.ok(environmentService.getAllEnvironments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnvironmentResponse> getEnvironmentById(@PathVariable Long id) {
        return ResponseEntity.ok(environmentService.getEnvironmentById(id));
    }

    @PostMapping
    public ResponseEntity<EnvironmentResponse> createEnvironment(@Valid @RequestBody EnvironmentRequest request) {
        EnvironmentResponse created = environmentService.createEnvironment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnvironmentResponse> updateEnvironment(@PathVariable Long id,
                                                                   @Valid @RequestBody EnvironmentRequest request) {
        return ResponseEntity.ok(environmentService.updateEnvironment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnvironment(@PathVariable Long id) {
        environmentService.deleteEnvironment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/deployments")
    public ResponseEntity<List<DeploymentResponse>> getDeploymentsForEnvironment(@PathVariable Long id) {
        return ResponseEntity.ok(deploymentService.getDeploymentsByEnvironment(id));
    }
}
