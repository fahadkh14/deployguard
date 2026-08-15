-- =====================================================================
-- DeployGuard - Database initialization script
-- Creates schema (tables, keys, indexes) and inserts sample data.
-- Run automatically by docker-compose, or manually with:
--   psql -U <user> -d <database> -f database/init.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    full_name     VARCHAR(150),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table: environments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS environments (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL UNIQUE,
    description   VARCHAR(500),
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table: applications
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL UNIQUE,
    description         VARCHAR(1000),
    git_repository_url  VARCHAR(500) NOT NULL,
    git_branch          VARCHAR(100) NOT NULL DEFAULT 'main',
    environment_id      BIGINT REFERENCES environments(id) ON DELETE SET NULL,
    current_version     VARCHAR(50),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_environment_id ON applications(environment_id);
CREATE INDEX IF NOT EXISTS idx_applications_name ON applications(name);

-- ---------------------------------------------------------------------
-- Table: deployments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deployments (
    id                    BIGSERIAL PRIMARY KEY,
    application_id        BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    environment_id        BIGINT NOT NULL REFERENCES environments(id) ON DELETE RESTRICT,
    version               VARCHAR(50) NOT NULL,
    branch                VARCHAR(100) NOT NULL,
    status                VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                          CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK')),
    started_at            TIMESTAMP,
    completed_at          TIMESTAMP,
    commit_sha            VARCHAR(64),
    deployment_message    VARCHAR(1000),
    created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_application_id ON deployments(application_id);
CREATE INDEX IF NOT EXISTS idx_deployments_environment_id ON deployments(environment_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);

-- ---------------------------------------------------------------------
-- Table: deployment_stages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deployment_stages (
    id             BIGSERIAL PRIMARY KEY,
    deployment_id  BIGINT NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    stage_name     VARCHAR(100) NOT NULL,
    stage_order    INTEGER NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED')),
    started_at     TIMESTAMP,
    completed_at   TIMESTAMP,
    message        VARCHAR(1000)
);

CREATE INDEX IF NOT EXISTS idx_deployment_stages_deployment_id ON deployment_stages(deployment_id);

-- ---------------------------------------------------------------------
-- Table: deployment_logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deployment_logs (
    id             BIGSERIAL PRIMARY KEY,
    deployment_id  BIGINT NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    level          VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message        VARCHAR(2000) NOT NULL,
    logged_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);

-- =====================================================================
-- Sample / seed data
-- =====================================================================

INSERT INTO users (username, email, full_name)
VALUES
    ('admin', 'admin@deployguard.local', 'DeployGuard Admin'),
    ('jdoe', 'jane.doe@deployguard.local', 'Jane Doe')
ON CONFLICT (username) DO NOTHING;

INSERT INTO environments (name, description, status)
VALUES
    ('Development', 'Development environment for active feature work', 'ACTIVE'),
    ('Staging', 'Pre-production environment for QA and validation', 'ACTIVE'),
    ('Production', 'Live production environment serving real users', 'ACTIVE')
ON CONFLICT (name) DO NOTHING;

INSERT INTO applications (name, description, git_repository_url, git_branch, environment_id, current_version)
VALUES
    ('DevBoard', 'Internal developer productivity dashboard', 'https://github.com/example/devboard', 'main',
        (SELECT id FROM environments WHERE name = 'Production'), 'v1.4.2'),
    ('PaymentsAPI', 'Core payments processing service', 'https://github.com/example/payments-api', 'main',
        (SELECT id FROM environments WHERE name = 'Production'), 'v3.2.0'),
    ('NotificationService', 'Handles email and push notifications', 'https://github.com/example/notification-service', 'develop',
        (SELECT id FROM environments WHERE name = 'Staging'), 'v0.9.1'),
    ('AuthGateway', 'Authentication and authorization gateway', 'https://github.com/example/auth-gateway', 'main',
        (SELECT id FROM environments WHERE name = 'Production'), 'v2.1.5'),
    ('AnalyticsPipeline', 'Batch analytics processing pipeline', 'https://github.com/example/analytics-pipeline', 'main',
        (SELECT id FROM environments WHERE name = 'Development'), 'v0.4.0')
ON CONFLICT (name) DO NOTHING;

-- Sample deployments for DevBoard
INSERT INTO deployments (application_id, environment_id, version, branch, status, started_at, completed_at, commit_sha, deployment_message)
SELECT a.id, e.id, 'v1.4.2', 'main', 'SUCCESS',
       NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 55 minutes',
       'a1b2c3d', 'Release v1.4.2 - fix dashboard widget rendering'
FROM applications a, environments e
WHERE a.name = 'DevBoard' AND e.name = 'Production'
ON CONFLICT DO NOTHING;

INSERT INTO deployments (application_id, environment_id, version, branch, status, started_at, completed_at, commit_sha, deployment_message)
SELECT a.id, e.id, 'v1.4.1', 'main', 'SUCCESS',
       NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 55 minutes',
       'f9e8d7c', 'Release v1.4.1 - minor UI polish'
FROM applications a, environments e
WHERE a.name = 'DevBoard' AND e.name = 'Production'
ON CONFLICT DO NOTHING;

-- Sample deployment for PaymentsAPI (failed)
INSERT INTO deployments (application_id, environment_id, version, branch, status, started_at, completed_at, commit_sha, deployment_message)
SELECT a.id, e.id, 'v3.2.1', 'main', 'FAILED',
       NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 50 minutes',
       'b4c5d6e', 'Release v3.2.1 - failed health check after deploy'
FROM applications a, environments e
WHERE a.name = 'PaymentsAPI' AND e.name = 'Production'
ON CONFLICT DO NOTHING;

-- Sample running deployment for NotificationService
INSERT INTO deployments (application_id, environment_id, version, branch, status, started_at, commit_sha, deployment_message)
SELECT a.id, e.id, 'v0.9.2', 'develop', 'RUNNING',
       NOW() - INTERVAL '5 minutes',
       'c7d8e9f', 'Deploying v0.9.2 to staging'
FROM applications a, environments e
WHERE a.name = 'NotificationService' AND e.name = 'Staging'
ON CONFLICT DO NOTHING;
