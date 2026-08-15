package com.deployguard.dto;

import com.deployguard.entity.DeploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentResponse {
    private Long id;
    private Long applicationId;
    private String applicationName;
    private Long environmentId;
    private String environmentName;
    private String version;
    private String branch;
    private DeploymentStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String commitSha;
    private String deploymentMessage;
    private LocalDateTime createdAt;
    private List<DeploymentStageResponse> stages;
}
