// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let testChannel;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ThreadAutoFollow: true,
                CollapsedThreads: 'default_off',
            },
        });
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel, user}) => {
            testTeam = team;
            testUser = user;
            testChannel = channel;

            cy.apiSaveCRTPreference(testUser.id, 'on');
            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Visit channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T1243 CTRL/CMD+K - Create thread, Open global threads and then from find channels switch channel using arrow keys and Enter', () => {
        // # Post message as other user
        cy.postMessageAs({
            sender: otherUser,
            message: 'Root post,',
            channelId: testChannel.id,
        }).then(({id: rootId}) => {
            // * Thread footer should not be visible
            cy.get(`#post_${rootId}`).find('.ThreadFooter').should('not.exist');

            // # Click on post to open RHS
            cy.get(`#post_${rootId}`).click();

            // * Button on header should say Follow as current user is not following
            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Follow');

            // # Post a reply as current user
            cy.postMessageReplyInRHS('Reply!');

            // # Get last root post
            cy.get(`#post_${rootId}`).

                // * thread footer should exist now
                get('.ThreadFooter').should('exist').
                within(() => {
                // * the button on the footer should say Following
                    cy.get('.FollowButton').should('have.text', 'Following');
                });

            // * the button on the RHS header should now say Following
            cy.get('#rhsContainer').find('.FollowButton').should('have.text', 'Following');

            // # Visit global threads
            cy.uiClickSidebarItem('threads');

            // * There should be a thread there
            cy.get('article.ThreadItem').should('have.have.lengthOf', 1);
        });

        // # Press CTRL/CMD+K
        cy.get('body').cmdOrCtrlShortcut('K');
        cy.get('#quickSwitchInput').type('T');

        // # Press down arrow
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}');

        // * Confirm the offtopic channel is selected in the suggestion list
        cy.get('#suggestionList').findByTestId('off-topic').should('be.visible').and('have.class', 'suggestion--selected');

        // # Press up arrow
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{uparrow}');

        // * Confirm the townsquare channel is selected in the suggestion list
        cy.get('#suggestionList').findByTestId('town-square').should('be.visible').and('have.class', 'suggestion--selected');

        // # Press down arrow
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}');

        // * Confirm the offtopic channel is selected in the suggestion list
        cy.get('#suggestionList').findByTestId('off-topic').should('be.visible').and('have.class', 'suggestion--selected');

        // # Press ENTER
        cy.get('body').type('{enter}');

        // * Confirm that channel is open, and post text box has focus
        cy.contains('#channelHeaderTitle', 'Off-Topic');
        cy.get('#post_textbox').should('be.focused');
    });
});
