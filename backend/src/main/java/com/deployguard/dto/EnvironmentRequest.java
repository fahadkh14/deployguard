package com.deployguard.dto;

import com.deployguard.entity.EnvironmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentRequest {

    @NotBlank(message = "Environment name is required")
    @Size(max = 50, message = "Environment name must be at most 50 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    private EnvironmentStatus status;
}
