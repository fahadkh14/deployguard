package com.deployguard.controller;

import com.deployguard.dto.DeploymentRequest;
import com.deployguard.dto.DeploymentResponse;
import com.deployguard.entity.DeploymentStatus;
import com.deployguard.service.DeploymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deployments")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    @GetMapping
    public ResponseEntity<List<DeploymentResponse>> getAllDeployments() {
        return ResponseEntity.ok(deploymentService.getAllDeployments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeploymentResponse> getDeploymentById(@PathVariable Long id) {
        return ResponseEntity.ok(deploymentService.getDeploymentById(id));
    }

    @PostMapping
    public ResponseEntity<DeploymentResponse> startDeployment(@Valid @RequestBody DeploymentRequest request) {
        DeploymentResponse created = deploymentService.startDeployment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeploymentResponse> updateStatus(@PathVariable Long id,
                                                             @RequestBody Map<String, String> body) {
        String statusValue = body.get("status");
        if (statusValue == null || statusValue.isBlank()) {
            throw new IllegalArgumentException("Field 'status' is required");
        }
        DeploymentStatus status;
        try {
            status = DeploymentStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status value: " + statusValue);
        }
        return ResponseEntity.ok(deploymentService.updateDeploymentStatus(id, status));
    }

    @PostMapping("/{id}/rollback")
    public ResponseEntity<DeploymentResponse> rollbackDeployment(@PathVariable Long id) {
        return ResponseEntity.ok(deploymentService.rollbackDeployment(id));
    }
}
