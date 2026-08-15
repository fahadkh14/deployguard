package com.deployguard.service;

import com.deployguard.dto.ApplicationRequest;
import com.deployguard.dto.ApplicationResponse;
import com.deployguard.dto.DeploymentRequest;
import com.deployguard.dto.DeploymentResponse;
import com.deployguard.dto.EnvironmentRequest;
import com.deployguard.dto.EnvironmentResponse;
import com.deployguard.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DeploymentServiceTest {

    @Autowired
    private DeploymentService deploymentService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private EnvironmentService environmentService;

    private Long applicationId;
    private Long environmentId;

    @BeforeEach
    void setUp() {
        ApplicationRequest appRequest = new ApplicationRequest();
        appRequest.setName("DeploymentTestApp");
        appRequest.setGitRepositoryUrl("https://github.com/example/deployment-test-app");
        appRequest.setGitBranch("main");
        ApplicationResponse app = applicationService.createApplication(appRequest);
        applicationId = app.getId();

        EnvironmentRequest envRequest = new EnvironmentRequest();
        envRequest.setName("TestEnv");
        envRequest.setDescription("Environment used for deployment tests");
        EnvironmentResponse env = environmentService.createEnvironment(envRequest);
        environmentId = env.getId();
    }

    private DeploymentRequest sampleDeploymentRequest() {
        DeploymentRequest request = new DeploymentRequest();
        request.setApplicationId(applicationId);
        request.setEnvironmentId(environmentId);
        request.setVersion("v1.0.0");
        request.setBranch("main");
        request.setCommitSha("abc123");
        request.setDeploymentMessage("Initial deployment");
        return request;
    }

    @Test
    void startDeployment_createsDeploymentWithStages() {
        DeploymentResponse response = deploymentService.startDeployment(sampleDeploymentRequest());

        assertNotNull(response.getId());
        assertNotNull(response.getStatus());
        assertFalse(response.getStages().isEmpty());
        assertEquals(applicationId, response.getApplicationId());
        assertEquals(environmentId, response.getEnvironmentId());
    }

    @Test
    void getDeploymentById_returnsCreatedDeployment() {
        DeploymentResponse created = deploymentService.startDeployment(sampleDeploymentRequest());

        DeploymentResponse fetched = deploymentService.getDeploymentById(created.getId());

        assertEquals(created.getId(), fetched.getId());
    }

    @Test
    void getDeploymentById_nonExistentId_throwsException() {
        assertThrows(ResourceNotFoundException.class, () -> deploymentService.getDeploymentById(999999L));
    }

    @Test
    void getDeploymentsByApplication_returnsOnlyMatchingDeployments() {
        deploymentService.startDeployment(sampleDeploymentRequest());
        deploymentService.startDeployment(sampleDeploymentRequest());

        List<DeploymentResponse> deployments = deploymentService.getDeploymentsByApplication(applicationId);

        assertEquals(2, deployments.size());
        deployments.forEach(d -> assertEquals(applicationId, d.getApplicationId()));
    }

    @Test
    void startDeployment_invalidApplication_throwsException() {
        DeploymentRequest request = sampleDeploymentRequest();
        request.setApplicationId(999999L);

        assertThrows(ResourceNotFoundException.class, () -> deploymentService.startDeployment(request));
    }
}
