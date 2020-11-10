// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Environment', () => {
    let townsquareLink;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
        });
    });

    it('MM-T959 - Web server mode - Webserver gzip', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/web_server`);

        // # Click dropdown to open selection
        cy.findByTestId('ServiceSettings.WebserverModedropdown').select('gzip');

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('small-image.png');

        // # Verify image is present in the post footer
        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        // # Verify image is not present in the post footer
        verifyImageInPostFooter(false);
    });

    it('MM-T960 - Web server mode - Webserver Uncompressed', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/web_server`);

        // # Click dropdown to open selection
        cy.findByTestId('ServiceSettings.WebserverModedropdown').select('Uncompressed');

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('small-image.png');

        // # Verify image is present in the post footer
        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        // # Verify image is not present in the post footer
        verifyImageInPostFooter(false);
    });

    it('MM-T961 - Web server mode - Webserver Disabled', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/web_server`);

        // # Click dropdown to open selection
        cy.findByTestId('ServiceSettings.WebserverModedropdown').select('Disabled');

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // # Navigate to a channel
        cy.visit(townsquareLink);

        // # Upload a file on center view
        cy.get('#fileUploadInput').attachFile('small-image.png');

        // # Verify image is present in the post footer
        verifyImageInPostFooter();

        // # Post message
        cy.postMessage('Image upload');

        // # Verify image is not present in the post footer
        verifyImageInPostFooter(false);
    });

    it('MM-T991 - Database fields can be edited and saved', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/database`);

        const queryTimeoutValue = 100;
        const maxOpenConnsValue = 1000;
        cy.findByTestId('queryTimeoutinput').clear().type(queryTimeoutValue);
        cy.findByTestId('maxOpenConnsinput').clear().type(maxOpenConnsValue);

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then(({config}) => {
            // * Verify the database setting values are saved
            expect(config.SqlSettings.QueryTimeout).to.eq(queryTimeoutValue);
            expect(config.SqlSettings.MaxOpenConns).to.eq(maxOpenConnsValue);
        });
    });

    it('MM-T993 - Minimum hashtag length at least 2', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/database`);

        const minimumHashtagOrig = 3;
        const minimumHashtagLength1 = 2;
        const minimumHashtagLength2 = 1;

        cy.findByTestId('minimumHashtagLengthinput').clear().type(minimumHashtagLength1);

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then(({config}) => {
            // * Verify the database setting values are saved
            expect(config.ServiceSettings.MinimumHashtagLength).to.eq(minimumHashtagLength1);
        });

        cy.findByTestId('minimumHashtagLengthinput').clear().type(minimumHashtagLength2);

        // # Click Save button to save the settings
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then(({config}) => {
            // * Verify the database setting values are saved
            expect(config.ServiceSettings.MinimumHashtagLength).to.eq(minimumHashtagOrig);
        });
    });

    it('MM-T994 - Fields editable when enabled, but not saveable until validated', () => {
        // * Check if server has license for Elasticsearch
        cy.apiRequireLicenseForFeature('Elasticsearch');

        cy.visit(`http://localhost:8065/admin_console/environment/elasticsearch`);

        // * Verify the ElasticSearch fields are disabled
        cy.findByTestId('connectionUrlinput').should('be.disabled');
        cy.findByTestId('skipTLSVerificationfalse').should('be.disabled');
        cy.findByTestId('usernameinput').should('be.disabled');
        cy.findByTestId('passwordinput').should('be.disabled');
        cy.findByTestId('snifftrue').should('be.disabled');
        cy.findByTestId('snifffalse').should('be.disabled');
        cy.findByTestId('enableSearchingtrue').should('be.disabled');
        cy.findByTestId('enableSearchingfalse').should('be.disabled');
        cy.findByTestId('enableAutocompletetrue').should('be.disabled');
        cy.findByTestId('enableAutocompletefalse').should('be.disabled');

        cy.visit('/admin_console/environment/elasticsearch');

        // # Enable Elasticsearch
        cy.findByTestId('enableIndexingtrue').check();

        // * Verify the ElasticSearch fields are enabled
        cy.findByTestId('connectionUrlinput').should('not.be.disabled');
        cy.findByTestId('skipTLSVerificationfalse').should('not.be.disabled');
        cy.findByTestId('usernameinput').should('not.be.disabled');
        cy.findByTestId('passwordinput').should('not.be.disabled');
        cy.findByTestId('snifftrue').should('not.be.disabled');
        cy.findByTestId('snifffalse').should('not.be.disabled');

        cy.get('.sidebar-section').first().click();

        // * Verify the behavior when Yes, Discard button in the confirmation message is clicked
        cy.get('#confirmModalButton').should('be.visible').and('have.text', 'Yes, Discard').click().wait(TIMEOUTS.HALF_SEC);
        cy.get('.confirmModal').should('not.exist');
    });

    it('MM-T995 - Amazon S3 settings', () => {
        cy.visit(`http://localhost:8065/admin_console/environment/file_storage`);

        // # CLick dropdown to open selection
        cy.findByTestId('FileSettings.DriverNamedropdown').select('Amazon S3');

        // Check that these fields are disabled
        cy.findByTestId('FileSettings.Directoryinput').should('be.disabled');

        // Check that these fields are not disabled
        cy.findByTestId('FileSettings.MaxFileSizenumber').should('not.be.disabled');
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').should('not.be.disabled');
        cy.findByTestId('FileSettings.AmazonS3PathPrefixinput').should('not.be.disabled');
        cy.findByTestId('FileSettings.AmazonS3Regioninput').should('not.be.disabled');
        cy.findByTestId('FileSettings.AmazonS3AccessKeyIdinput').should('not.be.disabled');

        const amazonS3BucketName = 'test';
        const amazonS3PathPrefix = 'test';
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').clear().type(amazonS3BucketName);
        cy.findByTestId('FileSettings.AmazonS3PathPrefixinput').clear().type(amazonS3PathPrefix);

        // # Click Save button to save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.HALF_MIN);

        // Get config again
        cy.apiGetConfig().then(({config}) => {
            // * Verify the database setting values are saved
            expect(config.FileSettings.AmazonS3Bucket).to.eq(amazonS3BucketName);
            expect(config.FileSettings.AmazonS3PathPrefix).to.eq(amazonS3PathPrefix);
        });
    });

    it('MM-T996 - Amazon S3 connection error messaging', () => {
        cy.visit('http://localhost:8065/admin_console/environment/file_storage');

        // # CLick dropdown to open selection
        cy.findByTestId('FileSettings.DriverNamedropdown').select('Amazon S3');

        const amazonS3PathPrefix = 'test';
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').clear();
        cy.findByTestId('FileSettings.AmazonS3PathPrefixinput').scrollIntoView().clear().type(amazonS3PathPrefix);

        // # Click Save button to save the settings
        cy.get('#saveSetting').click().wait(TIMEOUTS.FIVE_SEC);

        cy.get('#TestS3Connection').scrollIntoView().should('be.visible').within(() => {
            cy.findByText('Test Connection').should('be.visible').click().wait(TIMEOUTS.ONE_SEC);
            waitForAlert('Connection unsuccessful: S3 Bucket is required');
        });

        const amazonS3BucketName = '12';
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').clear().type(amazonS3BucketName);

        cy.get('#TestS3Connection').scrollIntoView().should('be.visible').within(() => {
            cy.findByText('Test Connection').should('be.visible').click().wait(TIMEOUTS.ONE_SEC);
            waitForAlert('Connection unsuccessful: S3 Bucket is required');
        });
    });

    function waitForAlert(message) {
        cy.waitUntil(() => cy.get('.alert').scrollIntoView().should('be.visible').then((alert) => {
            return alert[0].innerText === message;
        }));
    }

    function verifyImageInPostFooter(verifyExistence = true) {
        if (verifyExistence) {
            // * Verify that the image exists in the post message footer
            cy.get('#postCreateFooter').should('be.visible').find('div.post-image__column').
                should('exist').
                and('be.visible');
        } else {
            // * Verify that the image no longer exists in the post message footer
            cy.get('#postCreateFooter').find('div.post-image__column').should('not.exist');
        }
    }
});
