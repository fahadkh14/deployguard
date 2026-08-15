package com.deployguard.exception;

/**
 * Thrown when attempting to create a resource that violates a uniqueness constraint
 * (e.g. an Application name that already exists).
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
