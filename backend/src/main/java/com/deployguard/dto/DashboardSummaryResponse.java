package com.deployguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {
    private long totalApplications;
    private long totalDeployments;
    private long successfulDeployments;
    private long failedDeployments;
    private long runningDeployments;
    private long queuedDeployments;
    private double successRate;
    private List<DeploymentResponse> recentDeployments;
}
