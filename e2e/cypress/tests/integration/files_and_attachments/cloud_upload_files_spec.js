// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {interceptFileUpload, waitUntilUploadComplete} from './helpers';

const Gigabyte = 1 * 8 * 1024 * 1024 * 1024;

function simulateSubscription(subscription, currentStorageGB) {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: subscription,
    });

    cy.intercept('GET', '**/api/v4/cloud/limits', {
        statusCode: 200,
        body: {
            files: {
                total_storage: currentStorageGB,
            },
        },
    });

    cy.intercept('GET', '**/api/v4/cloud/products', {
        statusCode: 200,
        body: [
            {
                id: 'prod_1',
                sku: 'cloud-starter',
                price_per_seat: 0,
                name: 'Cloud Starter',
            },
            {
                id: 'prod_2',
                sku: 'cloud-professional',
                price_per_seat: 10,
                name: 'Cloud Professional',
            },
            {
                id: 'prod_3',
                sku: 'cloud-enterprise',
                price_per_seat: 30,
                name: 'Cloud Enterprise',
            },
        ],
    });
}

describe('Cloud Freemium limits Upload Files', () => {
    let channelUrl;
    let createdUser;
    let createdTeam;

    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    beforeEach(() => {
        // # Init setup
        cy.apiInitSetup().then((out) => {
            channelUrl = out.channelUrl;
            createdUser = out.user;
            createdTeam = out.team;

            cy.visit(channelUrl);
            interceptFileUpload();
        });
    });

    // afterEach(() => {
    //     cy.apiLogout();
    // });

    it('Show file limits banner for admin uploading files when above current freemium file storage limit of 10GB', () => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        const currentsubscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        const currentFileStorage = Gigabyte * 11;

        simulateSubscription(currentsubscription, currentFileStorage);

        const filename = 'svg.svg';

        cy.visit(channelUrl);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Attach file
        cy.get('#advancedTextEditorCell').find('#fileUploadInput').attachFile(filename);
        waitUntilUploadComplete();

        // * Banner shows
        cy.get('#cloud_file_limit_banner').should('exist');
        cy.get('#cloud_file_limit_banner').contains('Your free plan is limited to 10GB of files. New uploads will automatically archive older files');
        cy.get('#cloud_file_limit_banner').contains('upgrade to a paid plan');
    });

    it('Do not show file limits banner for admin uploading files and not above current freemium file storage limit of 10GB', () => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        const currentsubscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        const currentFileStorage = Gigabyte * 8;

        simulateSubscription(currentsubscription, currentFileStorage);

        const filename = 'svg.svg';

        cy.visit(channelUrl);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Attach file
        cy.get('#advancedTextEditorCell').find('#fileUploadInput').attachFile(filename);
        waitUntilUploadComplete();

        // banner doest not show
        cy.get('#cloud_file_limit_banner').should('not.exist');
    });

    it('Show file limits banner for non admin uploading files when above current freemium file storage limit of 10GB', () => {
        // # Login user
        cy.apiLogin(createdUser);

        const currentFileStorageGB = 11 * Gigabyte; // 11GB
        const currentsubscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        simulateSubscription(currentsubscription, currentFileStorageGB);

        const filename = 'svg.svg';

        cy.visit(channelUrl);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Attach file
        cy.get('#advancedTextEditorCell').find('#fileUploadInput').attachFile(filename);
        waitUntilUploadComplete();

        // * Banner shows
        cy.get('#cloud_file_limit_banner').should('exist');
        cy.get('#cloud_file_limit_banner').contains('Your free plan is limited to 10GB of files. New uploads will automatically archive older files');
        cy.get('#cloud_file_limit_banner').contains('notify your admin to upgrade to a paid plan');
    });
});

