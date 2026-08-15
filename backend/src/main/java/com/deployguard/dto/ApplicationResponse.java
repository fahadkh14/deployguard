package com.deployguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response payload representing an Application.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private String name;
    private String description;
    private String gitRepositoryUrl;
    private String gitBranch;
    private String environmentName;
    private String currentVersion;
    private long totalDeployments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
