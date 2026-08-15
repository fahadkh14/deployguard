package com.deployguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for creating or updating an Application.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    @NotBlank(message = "Application name is required")
    @Size(max = 150, message = "Application name must be at most 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotBlank(message = "Git repository URL is required")
    @Size(max = 500, message = "Git repository URL must be at most 500 characters")
    private String gitRepositoryUrl;

    @Size(max = 100, message = "Git branch must be at most 100 characters")
    private String gitBranch;

    /**
     * Name of the default environment for this application (e.g. "Development").
     * Optional - must match an existing Environment name if provided.
     */
    private String environmentName;

    @Size(max = 50, message = "Current version must be at most 50 characters")
    private String currentVersion;
}
