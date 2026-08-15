package com.deployguard.repository;

import com.deployguard.entity.DeploymentStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeploymentStageRepository extends JpaRepository<DeploymentStage, Long> {
    List<DeploymentStage> findByDeploymentIdOrderByStageOrderAsc(Long deploymentId);
}
