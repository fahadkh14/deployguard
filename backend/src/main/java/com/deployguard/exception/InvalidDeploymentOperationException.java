package com.deployguard.exception;

/**
 * Thrown when a deployment operation is not valid for the deployment's current state
 * (e.g. rolling back a deployment that never succeeded).
 */
public class InvalidDeploymentOperationException extends RuntimeException {
    public InvalidDeploymentOperationException(String message) {
        super(message);
    }
}
