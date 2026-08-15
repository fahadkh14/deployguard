package com.deployguard.repository;

import com.deployguard.entity.Deployment;
import com.deployguard.entity.DeploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {

    List<Deployment> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);

    List<Deployment> findByEnvironmentIdOrderByCreatedAtDesc(Long environmentId);

    List<Deployment> findByStatusOrderByCreatedAtDesc(DeploymentStatus status);

    List<Deployment> findTop10ByOrderByCreatedAtDesc();

    long countByStatus(DeploymentStatus status);

    @Query("select count(d) from Deployment d")
    long countAllDeployments();

    @Query("select d from Deployment d where d.application.id = :applicationId order by d.createdAt desc")
    List<Deployment> findRecentByApplication(@Param("applicationId") Long applicationId);
}
