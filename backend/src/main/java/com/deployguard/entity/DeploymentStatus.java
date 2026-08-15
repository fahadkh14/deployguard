package com.deployguard.entity;

/**
 * Represents the lifecycle status of a deployment.
 */
public enum DeploymentStatus {
    QUEUED,
    RUNNING,
    SUCCESS,
    FAILED,
    ROLLED_BACK
}
