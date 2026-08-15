package com.deployguard.dto;

import com.deployguard.entity.StageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentStageResponse {
    private Long id;
    private String stageName;
    private Integer stageOrder;
    private StageStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String durationText;
    private String message;

    public static String computeDurationText(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }
        Duration d = Duration.between(start, end);
        long seconds = d.getSeconds();
        if (seconds < 60) {
            return seconds + "s";
        }
        long minutes = seconds / 60;
        long remSeconds = seconds % 60;
        return minutes + "m " + remSeconds + "s";
    }
}
