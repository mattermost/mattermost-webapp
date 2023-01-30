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
    const host = window.host;

    beforeAll(() => {
        cy.apiLogout();
        cy.apiAdminLogin();
        cy.visit('/admin_console/billing/subscription');
    });

    it('Workspace deletion cta is not visible for cloud professional with a yearly plan', () => {
        // Professional Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_4',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('not.exist');
    });

    it('Workspace deletion cta is not visible for cloud enterprise with a yearly plan', () => {
        // Enterprise Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_5',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('not.exist');
    });

    it('Workspace deletion cta is visible for cloud free', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
    });

    it('Workspace deletion cta is visible for cloud professional with a monthly plan', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
    });

    it('Workspace deletion cta is visible for cloud enterprise with a monthly plan', () => {
        // Professional Yearly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_3',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
    });

    it('Workspace deletion modal > downgrade button is not visible for cloud free', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('not.exist');
    });

    it('Workspace deletion modal > downgrade button is visible for cloud professional', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist');
    });

    it('Workspace deletion modal > downgrade button is not visible for cloud enterprise', () => {
        // Free.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_4',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('not.exist');
    });

    it('Workspace deletion modal > delete workspace button click > feedback modal shown before submitting deletion request', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
    });

    it('Workspace deletion modal > delete workspace button click > feedback modal requires option selected to enable submit', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled');
    });

    it('Workspace deletion modal > downgrade workspace button click > feedback modal shown before submitting downgrade request', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace button click > feedback modal requires option selected to enable submit', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled');
    });

    it('Workspace deletion modal > delete workspace > after survey, a progress modal is displayed', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Delete').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('.DeleteWorkspaceProgressModal').should('be.visible');
    });

    it('Workspace deletion modal > delete workspace > after survey, a success modal is displayed when the deletion succeeds', () => {
        cy.intercept('POST', '/api/v4/cloud/delete-workspace', {statusCode: 200}).as('deleteWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('.DeleteWorkspaceProgressModal').should('be.visible');

        cy.wait('@deleteWorkspace');

        cy.find('.result_modal').should('exist');
        cy.find('Your workspace has been deleted').should('exist');
    });

    it('Workspace deletion modal > delete workspace > after survey, a failure modal is displayed when the deletion fails', () => {
        cy.intercept('POST', '/api/v4/cloud/delete-workspace', {statusCode: 500}).as('deleteWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('.DeleteWorkspaceProgressModal').should('be.visible');

        cy.wait('@deleteWorkspace');

        cy.find('.result_modal').should('exist');
        cy.find('Workspace deletion failed').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace > after survey, a progress modal is displayed', () => {
        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('#DowngradeModal').should('be.visible');
    });

    it('Workspace deletion modal > downgrade workspace > after survey, a success modal is displayed when the downgrade succeeds', () => {
        cy.intercept('PUT', '/api/v4/cloud/subscription', {statusCode: 200}).as('downgradeWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('#DowngradeModal').should('be.visible');

        cy.wait('@downgradeWorkspace');

        cy.find('.cloud_subscribe_result_modal').should('exist');
        cy.find('You are now subscribed to').should('exist');
    });

    it('Workspace deletion modal > downgrade workspace > after survey, a failure modal is displayed when the downgrade fails', () => {
        cy.intercept('PUT', '/api/v4/cloud/subscription', {statusCode: 500}).as('downgradeWorkspace');

        // Professional Monthly.
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_2',
            is_free_trial: 'false',
        };
        cy.simulateSubscription(subscription);

        cy.findByText(`Deleting ${host} is final and cannot be reversed.`).should('exist');
        cy.find('.cancelSubscriptionSection__contactUs').click();
        cy.find('.DeleteWorkspaceModal').should('exit');
        cy.find('.DeleteWorkspaceModal__Buttons-Downgrade').should('exist').click();
        cy.find('.FeedbackModal__Container').should('exist');
        cy.find('.radio').first().click();
        cy.find('.FeedbackModal__Submit > button.btn.btn-primary').should('be.enabled').click();
        cy.find('#DowngradeModal').should('be.visible');

        cy.wait('@downgradeWorkspace');

        cy.find('.cloud_subscribe_result_modal').should('exist');
        cy.find('We were unable to change your plan').should('exist');
    });
});
