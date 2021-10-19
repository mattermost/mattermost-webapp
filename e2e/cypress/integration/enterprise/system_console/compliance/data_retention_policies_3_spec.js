// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console @with_feature_flag

import * as TIMEOUTS from '../../../../fixtures/timeouts';

import {
    runDataRetentionAndVerifyPostDeleted,
    gotoGlobalPolicy,
    editGlobalPolicyMessageRetention,
    editGlobalPolicyFileRetention} from './helpers';

describe('Data Retention - Custom Policy Only', () => {
    let testTeam;
    let testChannel;
    let users;
    const postText = 'This is testing';

    before(() => {
        cy.apiRequireLicenseForFeature('DataRetention');

        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableUserAccessTokens: true,
            },
        });
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            users = user.id;
        });
    });

    beforeEach(() => {
        cy.apiGetCustomRetentionPolicies().then((result) => {
            result.body.policies.forEach((policy) => {
                cy.apiDeleteCustomRetentionPolicy(policy.id);
            });
        });
        cy.intercept({
            method: 'POST',
            url: '/api/v4/data_retention/policies',
        }).as('createCustomPolicy');

        // # Go to data retention settings page
        cy.uiGoToDataRetentionPage();
    });

    it('MM-T4097 - Assign Global Policy = Forever & Custom Policy = 10 days to Channel', () => {
        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '10');

        // # Add team to the policy
        cy.uiAddTeamsToCustomPolicy([testTeam.display_name]);

        // # Save policy
        cy.uiGetButton('Save').click();

        // * Verify team table pagination
        cy.get('#custom_policy_table .DataGrid').within(() => {
            cy.get('.DataGrid_rows .DataGrid_cell').first().should('contain.text', 'MyPolicy').click();
        });
        cy.get('.DataGrid_row .DataGrid_cell').first().should('contain', testTeam.display_name);

        // # Create more than one year older post
        // # Get Epoch value
        const createDays = new Date().setDate(new Date().getDate() - 12);
        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDays);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4098 - Assign Global Policy = Forever & Custom Policy = 1 year to Channels', () => {
        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '365');

        // # Add channel to the policy
        cy.uiAddChannelsToCustomPolicy([testChannel.display_name]);

        // # Save policy
        cy.uiGetButton('Save').click();

        // cy.get('.DataGrid_row').first().should('contain.text',testTeam.display_name);
        cy.wait('@createCustomPolicy').then((interception) => {
            // * Verify create policy api response

            const policyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                // * Verify custom policy data table
                cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '1 year', '0 teams, 1 channel');
            });
        });

        // # Create more than one year older post
        // # Get Epoch value
        const createDate = new Date().setMonth(new Date().getMonth() - 14);

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDate);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4105 - Assign Global Policy = Forever & Custom Policy = 1 year to Teams', () => {
        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '365');

        // # Add team to the policy
        cy.uiAddTeamsToCustomPolicy([testTeam.display_name]);

        // # Save policy
        cy.uiGetButton('Save').click();

        cy.wait('@createCustomPolicy').then((interception) => {
            // * Verify create policy api response

            const policyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                // * Verify custom policy data table
                cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '1 year', '1 team, 0 channels');
            });
        });

        // # Create more than one year older post
        // # Get Epoch value
        const createDate = new Date().setMonth(new Date().getMonth() - 14);

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDate);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4102 - Assign Global Policy = Forever & Custom Policy = 5 days to Teams', () => {
        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '5');

        // # Add team to the policy
        cy.uiAddTeamsToCustomPolicy([testTeam.display_name]);

        // # Save policy
        cy.uiGetButton('Save').click();

        cy.wait('@createCustomPolicy').then((interception) => {
            // * Verify create policy api response

            const policyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                // * Verify custom policy data table
                cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '5 days', '1 team, 0 channels');
            });
        });

        // # Create more than one year older post
        // # Get Epoch value
        const createDate = new Date().setMonth(new Date().getMonth() - 14);

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDate);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4104 - Assign Global policy = Forever & Custom Policy = 5 and 10 days to Teams', () => {
        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '5');

        // # Add team to the policy
        cy.uiAddTeamsToCustomPolicy([testTeam.display_name]);

        // # Save policy//
        cy.uiGetButton('Save').click();

        cy.wait('@createCustomPolicy').then((interception) => {
            // * Verify create policy api response
            const policyId = interception.response.body.id;
            cy.get('#custom_policy_table .DataGrid').within(() => {
                // * Verify custom policy data table
                cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '5 days', '1 team, 0 channels');
            });
        });

        // # Createing second policy
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy1', 'days', '10');

        // # Creating new Team and Channel
        let ChannelA;
        let newteam;
        cy.apiCreateTeam('team', 'Team1').then(({team}) => {
            cy.apiCreateChannel(team.id, 'test_channel', 'Channel-A').then(({channel}) => {
                ChannelA = channel;
                newteam = team;

                // # Add team to the policy
                cy.uiAddTeamsToCustomPolicy([newteam.display_name]);

                // # Save policy//
                cy.uiGetButton('Save').click();

                cy.wait('@createCustomPolicy').then((interception) => {
                    // * Verify create policy api response
                    const policyId = interception.response.body.id;
                    cy.get('#custom_policy_table .DataGrid').within(() => {
                        // * Verify custom policy data table
                        cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy1', '10 days', '1 team, 0 channels');
                    });
                });
            });
        });

        // # Create more 7 days older post
        // # Get Epoch value
        const createDate = new Date().setDate(new Date().getDate() - 7);

        cy.log(`this is testing ${createDate}`);

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDate);
            cy.apiCreatePost(ChannelA.id, postText, '', {}, token, true, createDate);

            runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);

            // # visiting a channel where Globle policy was applied
            cy.visit(`/${newteam.name}/channels/${ChannelA.name}`);

            // * Verifying if post was not deleted
            cy.findAllByTestId('postView').should('have.length', 2);
            cy.findAllByTestId('postView').should('contain', postText);
        });
    });

    it('MM-T4019 - Global Data Retention policy', () => {
        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('365', '1 year');

        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('700', '700 days');

        gotoGlobalPolicy();

        editGlobalPolicyMessageRetention('700', '700 days');

        gotoGlobalPolicy();

        // # Edit global policy file retention
        editGlobalPolicyFileRetention('365', '1 year');

        gotoGlobalPolicy();

        // # Edit global policy file retention
        editGlobalPolicyFileRetention('600', '600 days');
    });

    describe('Global and Custom Policy', () => {
        it('MM-T4100 - Assign Global Policy = 5 days & Custom Policy = 10 days to channels', () => {
            let newChannel;
            let newTeam;

            // # Edit Global Policy to 5 days
            gotoGlobalPolicy();
            editGlobalPolicyMessageRetention('5', '5 days');

            // # Creating new team for Global Policy
            cy.apiCreateTeam('team', 'Team1').then(({team}) => {
                cy.apiCreateChannel(team.id, 'test_channel', 'Channel-A').then(({channel}) => {
                    newChannel = channel;
                    newTeam = team;
                });
            });

            // # Go to create custom data retention page
            cy.uiClickCreatePolicy();

            // # Fill out policy details
            cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '10');

            // # Add channel to the policy
            cy.uiAddChannelsToCustomPolicy([testChannel.display_name]);

            // # Save policy
            cy.uiGetButton('Save').click();

            cy.wait('@createCustomPolicy').then((interception) => {
                // * Verify create policy api response
                const policyId = interception.response.body.id;
                cy.get('#custom_policy_table .DataGrid').within(() => {
                    // * Verify custom policy data table
                    cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '10 days', '0 teams, 1 channel');
                });
            });

            // # Create more than 7 days older post
            // # Get Epoch value
            const createDate = new Date().setDate(new Date().getDate() - 7);

            cy.apiCreateToken(users).then(({token}) => {
                // # Create a post
                cy.apiCreatePost(testChannel.id, postText, '', {}, token, true, createDate);
                cy.apiCreatePost(newChannel.id, postText, '', {}, token, true, createDate);

                runDataRetentionAndVerifyPostDeleted(newTeam, newChannel, postText);

                // # visiting a channel where Custom policy was applied
                cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

                // * Verifying that post should not be deleted
                cy.wait(TIMEOUTS.TEN_SEC);
                cy.reload();
                cy.findAllByTestId('postView').should('have.length', 2);
                cy.findAllByTestId('postView').should('contain', postText);
            });
        });
    });
});

