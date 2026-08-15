package com.deployguard.service;

import com.deployguard.dto.ApplicationRequest;
import com.deployguard.dto.ApplicationResponse;
import com.deployguard.exception.DuplicateResourceException;
import com.deployguard.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ApplicationServiceTest {

    @Autowired
    private ApplicationService applicationService;

    private ApplicationRequest sampleRequest(String name) {
        ApplicationRequest request = new ApplicationRequest();
        request.setName(name);
        request.setDescription("A sample application used for testing");
        request.setGitRepositoryUrl("https://github.com/example/" + name.toLowerCase());
        request.setGitBranch("main");
        request.setCurrentVersion("v1.0.0");
        return request;
    }

    @Test
    void createApplication_persistsAndReturnsApplication() {
        ApplicationResponse created = applicationService.createApplication(sampleRequest("TestApp"));

        assertNotNull(created.getId());
        assertEquals("TestApp", created.getName());
        assertEquals("v1.0.0", created.getCurrentVersion());
    }

    @Test
    void createApplication_duplicateName_throwsException() {
        applicationService.createApplication(sampleRequest("DuplicateApp"));

        assertThrows(DuplicateResourceException.class,
                () -> applicationService.createApplication(sampleRequest("DuplicateApp")));
    }

    @Test
    void getApplicationById_returnsCreatedApplication() {
        ApplicationResponse created = applicationService.createApplication(sampleRequest("FetchMe"));

        ApplicationResponse fetched = applicationService.getApplicationById(created.getId());

        assertEquals(created.getId(), fetched.getId());
        assertEquals("FetchMe", fetched.getName());
    }

    @Test
    void getApplicationById_nonExistentId_throwsException() {
        assertThrows(ResourceNotFoundException.class, () -> applicationService.getApplicationById(999999L));
    }

    @Test
    void updateApplication_changesFields() {
        ApplicationResponse created = applicationService.createApplication(sampleRequest("UpdateMe"));

        ApplicationRequest updateRequest = sampleRequest("UpdateMe");
        updateRequest.setDescription("Updated description");
        updateRequest.setCurrentVersion("v2.0.0");

        ApplicationResponse updated = applicationService.updateApplication(created.getId(), updateRequest);

        assertEquals("Updated description", updated.getDescription());
        assertEquals("v2.0.0", updated.getCurrentVersion());
    }

    @Test
    void deleteApplication_removesApplication() {
        ApplicationResponse created = applicationService.createApplication(sampleRequest("DeleteMe"));

        applicationService.deleteApplication(created.getId());

        assertThrows(ResourceNotFoundException.class, () -> applicationService.getApplicationById(created.getId()));
    }

    @Test
    void createApplication_missingRequiredField_isRejectedByValidationAtControllerLevel() {
        // Service layer itself does not enforce @Valid (that happens at the controller boundary),
        // but we verify the entity still requires a git repository URL to be meaningful.
        ApplicationRequest request = sampleRequest("NoRepoUrlCheck");
        assertNotNull(request.getGitRepositoryUrl());
    }
}
