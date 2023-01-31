// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

describe('Workspace deletion', () => {
    const host = window.location.host;

    beforeEach(() => {
        cy.apiLogout();
        cy.apiAdminLogin();
    });

    it('Workspace deletion cta is not visible for cloud professional with a yearly plan', () => {
        // Professional Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_4',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        // Text is separated by an html <a> tag, just get the last half.
        cy.findByText('is final and cannot be reversed.').should('not.exist');
    });

    it('Workspace deletion cta is not visible for cloud enterprise with a yearly plan', () => {
        // Enterprise Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_5',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        // Text is separated by an html <a> tag, just get the last half.
        cy.findByText('is final and cannot be reversed.').should('not.exist');
    });

    it('Workspace deletion cta is visible for cloud free', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').should('exist');
    });

    it('Workspace deletion cta is visible for cloud professional with a monthly plan', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').should('exist');
        cy.findByText(`${host}`).should('exist');
    });

    it('Workspace deletion cta is visible for cloud enterprise with a monthly plan', () => {
        // Professional Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        // Text is separated by an html <a> tag, just get the last half.
        cy.get('.cancelSubscriptionSection__contactUs').should('exist');
        cy.findByText(`${host}`).should('exist');
    });

    it('Workspace deletion modal > downgrade button is not visible for cloud free', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('not.exist');
    });

    it('Workspace deletion modal > downgrade button is visible for cloud professional', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.wait(100);

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist');
    });

    it('Workspace deletion modal > downgrade button is not visible for cloud enterprise', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('not.exist');
    });

    it('Workspace deletion modal > delete workspace button click > feedback modal shown before submitting deletion request', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
    });

    it('Workspace deletion modal > delete workspace button click > feedback modal requires option selected to enable submit', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled');
    });

    it('Workspace deletion modal > downgrade workspace button click > feedback modal shown before submitting downgrade request', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace button click > feedback modal requires option selected to enable submit', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled');
    });

    it('Workspace deletion modal > delete workspace > after survey, a success modal is displayed when the deletion succeeds', () => {
        cy.intercept('POST', '/api/v4/cloud/delete-workspace', {statusCode: 200, body: {reason: 'other', comments: 'test'}}).as('deleteWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();

        cy.wait('@deleteWorkspace');

        cy.get('.result_modal').should('exist');
        cy.findByText('Your workspace has been deleted').should('exist');
    });

    it('Workspace deletion modal > delete workspace > after survey, a failure modal is displayed when the deletion fails', () => {
        cy.intercept('POST', '/api/v4/cloud/delete-workspace', {statusCode: 500, body: {reason: 'other', comments: 'test'}}).as('deleteWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();

        cy.wait('@deleteWorkspace');

        cy.get('.result_modal').should('exist');
        cy.findByText('Workspace deletion failed').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace > after survey, a success modal is displayed when the downgrade succeeds', () => {
        cy.intercept('PUT', '/api/v4/cloud/subscription', {statusCode: 200, body: {product_id: 'cloud-starter', seats: 0, feedback: {reason: 'other', comments: 'test'}}}).as('downgradeWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();

        cy.wait('@downgradeWorkspace');

        cy.get('.cloud_subscribe_result_modal').should('exist');
        cy.findByText('You are now subscribed to Cloud Free').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace > after survey, a failure modal is displayed when the downgrade fails', () => {
        cy.intercept('PUT', '/api/v4/cloud/subscription', {statusCode: 500, body: {product_id: 'cloud-starter', seats: 0, feedback: {reason: 'other', comments: 'test'}}}).as('downgradeWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);
        cy.visit('/admin_console/billing/subscription');

        cy.get('.cancelSubscriptionSection__contactUs').click();
        cy.get('.DeleteWorkspaceModal').should('exist');
        cy.get('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.get('.FeedbackModal__Container').should('exist');
        cy.get('.radio > label > input').first().click();
        cy.get('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();

        cy.wait('@downgradeWorkspace');

        cy.get('.cloud_subscribe_result_modal').should('exist');
        cy.findByText('We were unable to change your plan').should('exist');
    });
});
