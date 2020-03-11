// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../utils';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const uniqueUserId = getRandomInt(99999);
const uniqueTeamId = getRandomInt(99999);

function signupWithEmailCreateTeam(name, pw, team) {
    // # Go to /login
    cy.visit('/login');

    // # Click on sign up button
    cy.get('#signup').click();

    // # Type email address (by adding the uniqueUserId in the email address)
    cy.get('#email').type('unique.' + uniqueUserId + '@sample.mattermost.com');

    // # Type 'unique-1' for username
    cy.get('#name').type(name);

    // # Type 'unique1pw' for password
    cy.get('#password').type(pw);

    // # Click on Create Account button
    cy.get('#createAccountButton').click();

    // # Click on Create a Team link
    cy.get('#createNewTeamLink').click();

    // # Fill out team name
    cy.get('#teamNameInput').type(team);

    // # Click Next
    cy.get('#teamNameNextButton').click();

    // # Click Finish
    cy.get('#teamURLFinishButton').click();
}

function goToNotifications() {
    // open preferences
    cy.get('#headerInfo').click();

    // open account settings
    cy.get('#accountSettings').click();

    // open notfications sub settings
    cy.get('#notificationsButton').click();

    // open keysTitle sub sub settings
    cy.get('#keysTitle').click();
}

describe('Email Address', () => {

    before(() => {
        // Set EnableOpenServer to true so users can sign up
        const newSettings = {
            TeamSettings: {EnableOpenServer: true},
        };
        cy.apiUpdateConfig(newSettings);
    });

    it('On14634 Email address already exists', () => {
        // # Signup a new user with an email address and user generated in signupWithEmail
        signupWithEmailCreateTeam('unique.' + uniqueUserId, 'unique1pw', 'team.' + uniqueTeamId);

        // # open up a specific notifications sub sub panel
        goToNotifications();

        // ensure "Your non-case sensitive username " is not checked
        cy.get('#notificationTriggerUsername').should('is.not.checked');

    });
});
