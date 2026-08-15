package com.deployguard.exception;

/**
 * Thrown when a requested resource (Application, Environment, Deployment, ...) cannot be found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
