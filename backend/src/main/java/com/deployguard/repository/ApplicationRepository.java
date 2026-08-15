package com.deployguard.repository;

import com.deployguard.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Application> findByNameIgnoreCase(String name);
}
