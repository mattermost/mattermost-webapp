// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

import {reUrl} from '../../utils';

const user1 = users['user-1'];
const user2 = users['user-2'];

const text = `Hello @${user2.username}`;
const feedbackEmail = 'test@example.com';

describe('Email notification', () => {
    before(() => {
        cy.apiUpdateConfig({EmailSettings: {FeedbackEmail: feedbackEmail}});
    });

    it('post a message that mentions a user', () => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        cy.postMessage(text);

        // Wait for a while to ensure that email notification is sent.
        cy.wait(TIMEOUTS.SMALL);

        cy.task('getRecentEmail', {username: 'user-2'}).then((response) => {
            verifyEmailNotification(response, 'eligendi', 'Town Square', user2, user1, text, feedbackEmail);

            const bodyText = response.data.body.text.split('\n');

            const permalink = bodyText[9].match(reUrl)[0];
            const permalinkPostId = permalink.split('/')[5];

            // # Visit permalink (e.g. click on email link)
            cy.visit(permalink);

            const postText = `#postMessageText_${permalinkPostId}`;
            cy.get(postText).should('have.text', text);

            cy.getLastPostId().then((postId) => {
                // * Should match last post and permalink post IDs
                expect(permalinkPostId).to.equal(postId);
            });
        });
    });
});

function verifyEmailNotification(response, teamDisplayName, channelDisplayName, mentionedUser, byUser, message, fromEmail) {
    const isoDate = new Date().toISOString().substring(0, 10);
    const {data, status} = response;

    // * Should return success status
    expect(status).to.equal(200);

    // * Verify that email is addressed to user-2
    expect(data.to.length).to.equal(1);
    expect(data.to[0]).to.contain(mentionedUser.email);

    // * Verify that email is from default feedback email
    expect(data.from).to.contain(fromEmail);

    // * Verify that date is current
    expect(data.date).to.contain(isoDate);

    // * Verify that the email subject is correct
    expect(data.subject).to.contain(`[Mattermost] Notification in ${teamDisplayName}`);

    // * Verify that the email body is correct
    const bodyText = data.body.text.split('\r\n');
    expect(bodyText.length).to.equal(16);
    expect(bodyText[1]).to.equal('You have a new notification.');
    expect(bodyText[4]).to.equal(`Channel: ${channelDisplayName}`);
    expect(bodyText[5]).to.contain(`@${byUser.username}`);
    expect(bodyText[7]).to.equal(`${message}`);
    expect(bodyText[9]).to.contain('Go To Post');
    expect(bodyText[11]).to.equal('Any questions at all, mail us any time: feedback@mattermost.com');
    expect(bodyText[12]).to.equal('Best wishes,');
    expect(bodyText[13]).to.equal('The Mattermost Team');
    expect(bodyText[15]).to.equal('To change your notification preferences, log in to your team site and go to Account Settings > Notifications.');
}
