package com.deployguard.dto;

import com.deployguard.entity.EnvironmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentResponse {
    private Long id;
    private String name;
    private String description;
    private EnvironmentStatus status;
    private LocalDateTime createdAt;
}
