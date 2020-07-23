// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @notification

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getEmailUrl, getEmailMessageSeparator, reUrl} from '../../utils';

let config;

describe('Email notification', () => {
    let testUser;
    let mentionedUser;
    let testTeam;

    before(() => {
        // # Do email test if setup properly
        cy.apiEmailTest();

        // # Get config
        cy.apiGetConfig().then((data) => {
            ({config} = data);
        });

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: newUser}) => {
                mentionedUser = newUser;
                cy.apiAddUserToTeam(team.id, newUser.id);
            });

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('post a message that mentions a user', () => {
        // # Post a message mentioning the new user
        const text = `Hello @${mentionedUser.username}`;
        cy.postMessage(text);

        // Wait for a while to ensure that email notification is sent.
        cy.wait(TIMEOUTS.FIVE_SEC);

        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        cy.task('getRecentEmail', {username: mentionedUser.username, mailUrl}).then((response) => {
            const messageSeparator = getEmailMessageSeparator(baseUrl);
            verifyEmailNotification(response, config.TeamSettings.SiteName, testTeam.display_name, 'Town Square', mentionedUser, testUser, text, config.EmailSettings.FeedbackEmail, config.SupportSettings.SupportEmail, messageSeparator);

            const bodyText = response.data.body.text.split('\n');

            const permalink = bodyText[9].match(reUrl)[0];
            const permalinkPostId = permalink.split('/')[6];

            // # Visit permalink (e.g. click on email link), view in browser to proceed
            cy.visit(permalink);
            cy.findByText('View in Browser').click();

            const postText = `#postMessageText_${permalinkPostId}`;
            cy.get(postText).should('have.text', text);

            cy.getLastPostId().then((postId) => {
                // * Should match last post and permalink post IDs
                expect(permalinkPostId).to.equal(postId);
            });
        });
    });
});

function verifyEmailNotification(response, siteName, teamDisplayName, channelDisplayName, mentionedUser, byUser, message, feedbackEmail, supportEmail, messageSeparator) {
    const isoDate = new Date().toISOString().substring(0, 10);
    const {data, status} = response;

    // * Should return success status
    expect(status).to.equal(200);

    // * Verify that email is addressed to mentionedUser
    expect(data.to.length).to.equal(1);
    expect(data.to[0]).to.contain(mentionedUser.email);

    // * Verify that email is from default feedback email
    expect(data.from).to.contain(feedbackEmail);

    // * Verify that date is current
    expect(data.date).to.contain(isoDate);

    // * Verify that the email subject is correct
    expect(data.subject).to.contain(`[${siteName}] Notification in ${teamDisplayName}`);

    // * Verify that the email body is correct
    const bodyText = data.body.text.split(messageSeparator);
    expect(bodyText.length).to.equal(16);
    expect(bodyText[1]).to.equal('You have a new notification.');
    expect(bodyText[4]).to.equal(`Channel: ${channelDisplayName}`);
    expect(bodyText[5]).to.contain(`@${byUser.username}`);
    expect(bodyText[7]).to.equal(`${message}`);
    expect(bodyText[9]).to.contain('Go To Post');
    expect(bodyText[11]).to.equal(`Any questions at all, mail us any time: ${supportEmail}`);
    expect(bodyText[12]).to.equal('Best wishes,');
    expect(bodyText[13]).to.equal(`The ${siteName} Team`);
    expect(bodyText[15]).to.equal('To change your notification preferences, log in to your team site and go to Account Settings > Notifications.');
}
