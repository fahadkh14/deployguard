package com.deployguard.repository;

import com.deployguard.entity.DeploymentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeploymentLogRepository extends JpaRepository<DeploymentLog, Long> {
    List<DeploymentLog> findByDeploymentIdOrderByLoggedAtAsc(Long deploymentId);
}
