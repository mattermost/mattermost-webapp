// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// *****************************************************************************
// Data Retention
// https://api.mattermost.com/#tag/data-retention
// *****************************************************************************

import {ResponseT} from './types';

function apiGetCustomRetentionPolicies(page = 0, perPage = 100): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies?page=${page}&per_page=${perPage}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiGetCustomRetentionPolicies', apiGetCustomRetentionPolicies);

function apiGetCustomRetentionPolicy(id: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiGetCustomRetentionPolicy', apiGetCustomRetentionPolicy);

function apiDeleteCustomRetentionPolicy(id: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}`,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiDeleteCustomRetentionPolicy', apiDeleteCustomRetentionPolicy);

function apiGetCustomRetentionPolicyTeams(id: string, page = 0, perPage = 100): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}/teams?page=${page}&per_page=${perPage}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiGetCustomRetentionPolicyTeams', apiGetCustomRetentionPolicyTeams);

function apiGetCustomRetentionPolicyChannels(id: string, page = 0, perPage = 100): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}/channels?page=${page}&per_page=${perPage}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiGetCustomRetentionPolicyChannels', apiGetCustomRetentionPolicyChannels);

function apiSearchCustomRetentionPolicyTeams(id: string, term: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}/teams/search`,
        method: 'POST',
        body: {term},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiSearchCustomRetentionPolicyTeams', apiSearchCustomRetentionPolicyTeams);

function apiSearchCustomRetentionPolicyChannels(id: string, term: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/data_retention/policies/${id}/channels/search`,
        method: 'POST',
        body: {term},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiSearchCustomRetentionPolicyChannels', apiSearchCustomRetentionPolicyChannels);

function apiDeleteAllCustomRetentionPolicies() {
    cy.apiGetCustomRetentionPolicies().then((result) => {
        result.body.policies.forEach((policy: {id: string}) => {
            cy.apiDeleteCustomRetentionPolicy(policy.id);
        });
    });
}

Cypress.Commands.add('apiDeleteAllCustomRetentionPolicies', apiDeleteAllCustomRetentionPolicies);

function apiPostWithCreateDate(channelId: string, message: string, token: string, createAt: number): ResponseT<any> {
    const headers: Record<string, string> = {'X-Requested-With': 'XMLHttpRequest'};
    if (token !== '') {
        headers.Authorization = `Bearer ${token}`;
    }
    return cy.request({
        headers,
        url: '/api/v4/posts',
        method: 'POST',
        body: {
            channel_id: channelId,
            create_at: createAt,
            message,
        },
    });
}

Cypress.Commands.add('apiPostWithCreateDate', apiPostWithCreateDate);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Delete all custom retention policies
             */
            apiDeleteAllCustomRetentionPolicies: typeof apiDeleteAllCustomRetentionPolicies;

            /**
             * Create a post with create_at prop via API
             * @param {string} channelId - Channel ID
             * @param {string} message - Post a message
             * @param {string} token - token
             * @param {number} createat -  epoch date
             */
            apiPostWithCreateDate: typeof apiPostWithCreateDate;

            /**
             * Get all Custom Retention Policies
             * @param {Integer} page - The page to select
             * @param {Integer} perPage - The number of policies per page
             */
            apiGetCustomRetentionPolicies: typeof apiGetCustomRetentionPolicies;

            /**
             * Get a Custom Retention Policy
             * @param {string} id - The id of the policy
             */
            apiGetCustomRetentionPolicy: typeof apiGetCustomRetentionPolicy;

            /**
             * Delete Custom Retention Policy
             * @param {string} id - The id of the policy
             */
            apiDeleteCustomRetentionPolicy: typeof apiDeleteCustomRetentionPolicy;

            /**
             * Get Custom Retention Policy teams
             * @param {string} id - The id of the policy
             * @param {Integer} page - The page to select
             * @param {Integer} perPage - The number of policy teams per page
             */
            apiGetCustomRetentionPolicyTeams: typeof apiGetCustomRetentionPolicyTeams;

            /**
             * Get Custom Retention Policy channels
             * @param {string} id - The id of the policy
             * @param {Integer} page - The page to select
             * @param {Integer} perPage - The number of policy channels per page
             */
            apiGetCustomRetentionPolicyChannels: typeof apiGetCustomRetentionPolicyChannels;

            /**
             * Search Custom Retention Policy teams
             * @param {string} id - The id of the policy
             * @param {string} term - The team search term
             */
            apiSearchCustomRetentionPolicyTeams: typeof apiSearchCustomRetentionPolicyTeams;

            /**
             * Search Custom Retention Policy teams
             * @param {string} id - The id of the policy
             * @param {string} term - The channel search term
             */
            apiSearchCustomRetentionPolicyChannels: typeof apiSearchCustomRetentionPolicyChannels;
        }
    }
}
