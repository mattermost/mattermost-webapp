// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import { loginAndVisitChannel } from './helper';
import { getJoinEmailTemplate, verifyEmailBody } from "../../../utils";

describe('Integrations', () => {
    let testUser;
    let testTeam;
    const usersToInvite = [];
    let siteName;
    let testChannelUrl;

    before(() => {
        cy.apiGetConfig().then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            Cypress._.times(2, () => {
                cy.apiCreateUser().then(({user: otherUser}) => {
                    usersToInvite.push(otherUser);
                });
            });
    
            cy.apiAdminLogin();
            cy.apiCreateChannel(team.id, 'channel', 'channel').then(({channel}) => {
                testChannelUrl = `/${team.name}/channels/${channel.name}`;
                cy.apiAddUserToChannel(channel.id, testUser.id);
            });
        });
    });

    it('MM-T575 /invite-people', () => {
        loginAndVisitChannel(testUser, testChannelUrl);

        // # Post `/invite email1 email2` where emails are of users not added to the team yet
        cy.postMessage(`/invite_people ${usersToInvite.map(user => user.email).join(" ")} `);

        // * User who added them sees system message "Email invite(s) sent"
        cy.uiWaitUntilMessagePostedIncludes(`Email invite(s) sent`);

        usersToInvite.forEach(invitedUser => {
            cy.getRecentEmail({username: invitedUser.username, email: invitedUser.email}).then((data) => {
                const {body: actualEmailBody, subject} = data;
    
                // * Verify the subject
                expect(subject).to.contain(`[${siteName}] ${testUser.username} invited you to join ${testTeam.display_name} Team`);
    
                // * Verify email body
                const expectedEmailBody = getJoinEmailTemplate(testUser.username, invitedUser.email, testTeam);
                verifyEmailBody(expectedEmailBody, actualEmailBody);
            });
        })
    });
});
