// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import {
    gotoGlobalPolicy,
    editGlobalPolicyMessageRetention,
    runDataRetentionAndVerifyPostDeleted,
} from './helpers';

describe('Data Retention - Global and Custom Policy Only', () => {
    let testTeam;
    let testChannel;
    let users;
    let newChannel;
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
        cy.apiDeleteAllCustomRetentionPolicies();
        cy.intercept({
            method: 'POST',
            url: '/api/v4/data_retention/policies',
        }).as('createCustomPolicy');

        // # Go to data retention settings page
        cy.uiGoToDataRetentionPage();
    });

    it('MM-T4093 - Assign Global Policy = 10 Days & Custom Policy = None to channel', () => {
        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('10', '10 days');

        // * Verify there is no any team and channel assigned
        cy.get('#custom_policy_table .DataGrid').within(() => {
            cy.get('.DataGrid_rows .DataGrid_empty').first().should('contain.text', 'No items found');
        });

        // # Create 13 days older post
        // # Get Epoch value
        const createDays = new Date().setDate(new Date().getDate() - 13);
        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiPostWithCreateDate(testChannel.id, postText, token, createDays);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4099 - Assign Global Policy = 10 Days & Custom Policy = 5 days to Channels', () => {
        // # Edit Global Policy to 10 days
        gotoGlobalPolicy();
        editGlobalPolicyMessageRetention('10', '10 days');

        // # Go to create custom data retention page
        cy.uiClickCreatePolicy();

        // # Fill out policy details
        cy.uiFillOutCustomPolicyFields('MyPolicy', 'days', '5');

        // # Add channel to the policy
        cy.uiAddChannelsToCustomPolicy([testChannel.display_name]);

        // # Save policy
        cy.uiGetButton('Save').click();

        // # Creating new channel
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'GlobalChannel ').then(({channel}) => {
            newChannel = channel;
        });

        cy.wait('@createCustomPolicy').then((interception) => {
            // * Verify create policy api response

            const policyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                // * Verify custom policy data table
                cy.uiVerifyCustomPolicyRow(policyId, 'MyPolicy', '5 days', '0 teams, 1 channel');
            });
        });

        // # Create more than 7 days older post
        // # Get Epoch value
        const createDate = new Date().setDate(new Date().getDate() - 7);

        cy.apiCreateToken(users).then(({token}) => {
            // # Create posts
            cy.apiPostWithCreateDate(testChannel.id, postText, token, createDate);
            cy.apiPostWithCreateDate(newChannel.id, postText, token, createDate);

            runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);

            // # visiting a channel where Globle policy was applied
            cy.visit(`/${testTeam.name}/channels/${newChannel.name}`);

            // * Verifying if post was not deleted
            cy.findAllByTestId('postView').should('have.length', 2);
            cy.findAllByTestId('postView').should('contain', postText);
        });
    });

    it('MM-T4101 - Assign Global Policy = 5 days & Custom Policy = None to Teams', () => {
        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('5', '5 days');

        // * Verify there is no any team and channel assigned
        cy.get('#custom_policy_table .DataGrid').within(() => {
            cy.get('.DataGrid_rows .DataGrid_empty').first().should('contain.text', 'No items found');
        });

        // # Create 7 and 13 days older posts
        // # Get Epoch value
        const createDays1 = new Date().setDate(new Date().getDate() - 7);
        const createDays2 = new Date().setDate(new Date().getDate() - 3);

        // # Creating new channel
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'OtherChannel ').then(({channel}) => {
            newChannel = channel;
        });

        // # Creating new Team and Channel
        let ChannelA;

        cy.apiCreateTeam('team', 'Team1').then(({team}) => {
            cy.apiCreateChannel(team.id, 'test_channel', 'Channel-A').then(({channel}) => {
                ChannelA = channel;
            });
        });

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiPostWithCreateDate(testChannel.id, postText, token, createDays1);
            cy.apiPostWithCreateDate(newChannel.id, postText, token, createDays1);
            cy.apiPostWithCreateDate(ChannelA.id, postText, token, createDays2);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4103 - Assign Global Policy = 5 days & Custom Policy = None to Teams', () => {
        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('5', '5 days');

        // * Verify there is no any team and channel assigned
        cy.get('#custom_policy_table .DataGrid').within(() => {
            cy.get('.DataGrid_rows .DataGrid_empty').first().should('contain.text', 'No items found');
        });

        // # Create 13 days older post
        // # Get Epoch value
        const createDays1 = new Date().setDate(new Date().getDate() - 7);
        const createDays2 = new Date().setDate(new Date().getDate() - 3);

        // # Creating new Team and Channel
        let ChannelA;

        cy.apiCreateTeam('team', 'Team1').then(({team}) => {
            cy.apiCreateChannel(team.id, 'test_channel', 'Channel-A').then(({channel}) => {
                ChannelA = channel;
            });
        });

        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiPostWithCreateDate(testChannel.id, postText, token, createDays1);
            cy.apiCreatePost(ChannelA.id, postText, '', {}, token, true, createDays2);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });

    it('MM-T4096 - Assign Global Policy = 1 Year & Custom Policy = None to channel', () => {
        gotoGlobalPolicy();

        // # Edit global policy message retention
        editGlobalPolicyMessageRetention('365', '1 year');

        // * Verify there is no any team and channel assigned
        cy.get('#custom_policy_table .DataGrid').within(() => {
            cy.get('.DataGrid_rows .DataGrid_empty').first().should('contain.text', 'No items found');
        });

        // # Create more than one year older post
        // # Get Epoch value
        const createDate = new Date().setMonth(new Date().getMonth() - 14);
        cy.apiCreateToken(users).then(({token}) => {
            // # Create a post
            cy.apiPostWithCreateDate(testChannel.id, postText, token, createDate);
        });

        runDataRetentionAndVerifyPostDeleted(testTeam, testChannel, postText);
    });
});
