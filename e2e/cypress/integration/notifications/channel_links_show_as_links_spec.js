// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notifications

import * as TIMEOUTS from '../../fixtures/timeouts';
import {
    getEmailUrl,
    reUrl,
    splitEmailBodyText,
} from '../../utils';
const baseUrl = Cypress.config('baseUrl');
const mailUrl = getEmailUrl(baseUrl);

describe('Notifications', () => {
    let testTeam;
    let otherUser;
    let lastPostId;
    const channelName = 'off-topic';
    before(() => {
        cy.apiEmailTest();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.apiCreateUser().then(({user}) => {
                otherUser = user;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
                cy.apiLogin(otherUser);
            });

            // # As otherUser, set status to offline and logout
            cy.visit(`/${testTeam.name}/channels/off-topic`);
            cy.findByLabelText('set status').should('be.visible').click();
            cy.findByText('Offline').should('be.visible').click();
            cy.apiLogout();

            // # Login as sysadmin and go to the Off-Topic channel
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}/channels/off-topic`);
        });
    });

    it('MM-T506 Channel links show as links in notification emails', () => {
        // # Open 'Notifications' of 'Account Settings' modal
        cy.uiOpenAccountSettingsModal('Notifications').within(() => {
            // # Open 'Email Notifications' setting and set to 'Immediately'
            cy.findByRole('heading', {name: 'Email Notifications'}).should('be.visible').click();
            cy.findByRole('radio', {name: 'Immediately'}).click().should('be.checked');

            // # Save then close the modal
            cy.uiSaveAndClose();
        });

        // # Post a message as sysadmin that contains the channel name and otherUser's username
        cy.postMessage(`This is a message in ~${channelName} channel for @${otherUser.username}`);

        cy.getLastPostId().then((postId) => {
            lastPostId = postId;
        });

        // # Logout from sysadmin account and login as otherUser
        cy.apiLogout();
        cy.apiLogin(otherUser);

        cy.task('getRecentEmail', {username: otherUser.username, mailUrl}).then((response) => {
            const bodyText = splitEmailBodyText(response.data.body.text);

            // * Verify that the email was properly received and has the correct output
            verifyEmailNotification(response, testTeam.name, testTeam.display_name, otherUser.email);

            const permalink = bodyText[9].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);

            // # Choose the 'View in Browser' option
            cy.findByText('View in Browser', {timeout: TIMEOUTS.HALF_MIN}).click();

            // * Verify that the post message that otherUser was notified of in the email is visible
            cy.get(`#postMessageText_${lastPostId}`, {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
        });
    });

    const verifyEmailNotification = (response, teamName, teamDisplayName, email) => {
        const isoDate = new Date().toISOString().substring(0, 10);
        const {data, status} = response;

        // * Should return success status
        expect(status).to.equal(200);

        // * Verify that email is addressed to the correct user
        expect(data.to.length).to.equal(1);
        expect(data.to[0]).to.contain(email);

        // * Verify that date is current
        expect(data.date).to.contain(isoDate);

        // * Verify that the email subject is correct
        expect(data.subject).to.contain(`[Mattermost] Notification in ${teamDisplayName}`);

        // * Verify that the email body is correct
        const bodyText = splitEmailBodyText(data.body.text);
        expect(bodyText.length).to.equal(16);
        expect(bodyText[1]).to.equal('You have a new notification.');
        expect(bodyText[4]).to.equal('Channel: Off-Topic');
        expect(bodyText[5]).to.contain('@sysadmin');
        expect(bodyText[7]).to.equal(`This is a message in ~${channelName} ( ${baseUrl}/landing#/${teamName}/channels/${channelName} ) channel for @${otherUser.username}`);
        expect(bodyText[9]).to.equal(`Go To Post ( ${baseUrl}/landing#/${teamName}/pl/${lastPostId} )`);
    };
});
