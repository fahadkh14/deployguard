package com.deployguard.entity;

/**
 * Represents the status of an individual stage within a deployment pipeline
 * (e.g. Build, Test, Security Scan, Deploy, Health Check).
 */
public enum StageStatus {
    PENDING,
    RUNNING,
    SUCCESS,
    FAILED,
    SKIPPED
}
