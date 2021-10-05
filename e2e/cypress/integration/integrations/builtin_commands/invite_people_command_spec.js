// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

import {loginAndVisitChannel} from './helper';

describe('Integrations', () => {
    let testUser;
    let testTeam;
    const userGroup = [];
    let testChannelUrl;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            Cypress._.times(2, () => {
                cy.apiCreateUser().then(({user: otherUser}) => {
                    userGroup.push(otherUser);
                });
            });
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiCreateChannel(testTeam.id, 'channel', 'channel').then(({channel}) => {
            testChannelUrl = `/${testTeam.name}/channels/${channel.name}`;
            cy.apiAddUserToChannel(channel.id, testUser.id);
        });
    });

    it('MM-T575 /invite-people', () => {
        const [user1ToInvite, user2ToInvite] = userGroup;

        loginAndVisitChannel(testUser, testChannelUrl);

        // # Post `/invite email1 email2` where emails are of users not added to the team yet
        cy.postMessage(`/invite_people ${user1ToInvite.email} ${user2ToInvite.email} `);

        // * User who added them sees system message "Email invite(s) sent"
        cy.uiWaitUntilMessagePostedIncludes(`Email invite(s) sent`);
    });
});
