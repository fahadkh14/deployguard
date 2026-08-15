package com.deployguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for starting a new deployment.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentRequest {

    @NotNull(message = "Application id is required")
    private Long applicationId;

    @NotNull(message = "Environment id is required")
    private Long environmentId;

    @NotBlank(message = "Version is required")
    @Size(max = 50, message = "Version must be at most 50 characters")
    private String version;

    @Size(max = 100, message = "Branch must be at most 100 characters")
    private String branch;

    @Size(max = 64, message = "Commit SHA must be at most 64 characters")
    private String commitSha;

    @Size(max = 1000, message = "Deployment message must be at most 1000 characters")
    private String deploymentMessage;
}
