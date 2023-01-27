// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from 'mattermost-redux/types/users';

const seatsPurchased = parseInt(Cypress.env('numberOfTrialUsers'), 10);
const seatsMinimumFor10PercentageState = (Math.ceil(seatsPurchased * 0.1)) + seatsPurchased;
const emailTest = 'test@mattermost.com';
const text10PercentageState = `Your workspace user count has exceeded your paid license seat count by ${seatsMinimumFor10PercentageState - seatsPurchased} seats. Purchase additional seats to remain compliant.`;
const seatsMinimumFor5PercentageState = (Math.ceil(seatsPurchased * 0.05)) + seatsPurchased;
const text5PercentageState = `Your workspace user count has exceeded your paid license seat count by ${seatsMinimumFor5PercentageState - seatsPurchased} seats. Purchase additional seats to remain compliant.`;

const expandSeatsTextLink = 'Purchase additional seats';

const withEmailLicense = (email = emailTest) => {
    cy.intercept('GET', '**/api/v4/license/client', {
        statusCode: 200,
        body: {
            IsLicensed: 'true',
            IssuedAt: '1517714643650',
            StartsAt: '1517714643650',
            ExpiresAt: '1620335443650',
            SkuShortName: 'Enterprise',
            Name: 'LicenseName',
            Company: 'Mattermost Inc.',
            Users: String(seatsPurchased),
            Email: email,
        },
    });
};

const withSubscriptionExpendable = (isExpendable: boolean) => {
    cy.intercept('GET', '**/api/v4/cloud/subscription/expandable', {
        statusCode: 200,
        body: {
            is_expendable: isExpendable,
        },
    });
};

describe('Global Info Banner overage users', () => {
    let url: string;
    let createdUser: UserProfile;

    beforeEach(() => {
        cy.intercept('GET', '**/api/v4/analytics/old', {
            statusCode: 200,
            body: [
                {name: 'channel_open_count', value: 2},
                {name: 'channel_private_count', value: 0},
                {name: 'post_count', value: 3},
                {name: 'unique_user_count', value: seatsMinimumFor5PercentageState},
                {name: 'team_count', value: 1},
                {name: 'total_websocket_connections', value: 0},
                {name: 'total_master_db_connections', value: 12},
                {name: 'total_read_db_connections', value: 0},
                {name: 'daily_active_users', value: 1},
                {name: 'monthly_active_users', value: 1},
                {name: 'inactive_user_count', value: 0},
            ],
        });

        cy.apiInitSetup().then(({user, offTopicUrl}) => {
            url = offTopicUrl;
            createdUser = user;
            cy.apiAdminLogin();
            cy.visit(url);
        });
    });

    it('should show the banner with Contact Sales CTA because the license is sales type', () => {
        withEmailLicense(createdUser.email);
        withSubscriptionExpendable(false);
        cy.apiLogout();
        cy.apiLogin(createdUser);
        cy.visit(url);

        // * Check the cta banner exist
        cy.findByText(text5PercentageState).should('exist');
        cy.findByText('Contact Sales').should('exist');
    });

    it('should show the banner with Purchase additional seats CTA because the license is self serve', () => {
        withEmailLicense(createdUser.email);
        withSubscriptionExpendable(true);
        cy.apiLogout();
        cy.apiLogin(createdUser);
        cy.visit(url);

        // * Check the cta banner exist
        cy.findByText(text5PercentageState).should('exist');
        cy.findByText(expandSeatsTextLink).should('exist');
    });
});

describe('Global Error Banner overage users', () => {
    let url: string;
    let createdUser: UserProfile;

    beforeEach(() => {
        cy.intercept('GET', '**/api/v4/analytics/old', {
            statusCode: 200,
            body: [
                {name: 'channel_open_count', value: 2},
                {name: 'channel_private_count', value: 0},
                {name: 'post_count', value: 3},
                {name: 'unique_user_count', value: seatsMinimumFor10PercentageState},
                {name: 'team_count', value: 1},
                {name: 'total_websocket_connections', value: 0},
                {name: 'total_master_db_connections', value: 12},
                {name: 'total_read_db_connections', value: 0},
                {name: 'daily_active_users', value: 1},
                {name: 'monthly_active_users', value: 1},
                {name: 'inactive_user_count', value: 0},
            ],
        });

        cy.apiInitSetup().then(({user, offTopicUrl}) => {
            url = offTopicUrl;
            createdUser = user;
            cy.apiAdminLogin();
            cy.visit(url);
        });
    });

    it('should show the banner with Contact Sales CTA because it\'s the admin who purchased the license', () => {
        withEmailLicense(createdUser.email);
        withSubscriptionExpendable(false);
        cy.apiLogout();
        cy.apiLogin(createdUser);
        cy.visit(url);

        // * Check the cta banner exist
        cy.findByText(text10PercentageState).should('exist');
        cy.findByText('Contact Sales').should('exist');
    });

    it('should show the banner with Purchase additional seats CTA because the license is self serve', () => {
        withEmailLicense(createdUser.email);
        withSubscriptionExpendable(true);
        cy.apiLogout();
        cy.apiLogin(createdUser);
        cy.visit(url);

        // * Check the cta banner exist
        cy.findByText(text10PercentageState).should('exist');
        cy.findByText(expandSeatsTextLink).should('exist');
    });
});
