// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

function verifyFocusInAddChannelMemberModal() {
    // # Click to access the Channel menu
    cy.get('#channelHeaderTitle').click();

    // * The dropdown menu of the channel header should be visible;
    cy.get('#channelLeaveChannel').should('be.visible');

    // # Click 'Add Members'
    cy.get('#channelAddMembers').click();

    // * Assert that modal appears
    cy.get('#addUsersToChannelModal').should('be.visible');

    // * Assert that the input box is in focus
    cy.get('#selectItems input').should('be.focused');

    // # Push a character key such as "A"
    cy.focused().type('A');

    // * Check that input box has character A
    cy.get('#selectItems input').should('have.value', 'A');

    // # Click anywhere in the modal that is not on a field that can take focus
    cy.get('#channelInviteModalLabel').click();

    // * Note the focus has been removed from the search box
    cy.get('#selectItems input').should('not.be.focused');

    // # Push a character key such as "A"
    cy.get('body').type('A');

    // * Focus is not moved anywhere. Neither the search box or main input box has the focus
    cy.get('#selectItems input').should('not.be.focused').and('have.value', 'A');
    cy.get('#post_textbox').should('not.be.focused');
}

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
    });

    beforeEach(() => {
        cy.visit('/');
    });

    it('M15406 - Focus move from Recent Mentions to main input box when a character key is selected', () => {
        //#Click the flag icon to open the flagged posts RHS to move the focus out of the main input box
        cy.get('#channelHeaderFlagButton').click();

        //#Making sure Flagged Posts is present on the page
        cy.contains('Flagged Posts').should('be.visible');
        cy.get('#post_textbox').should('not.be.focused');

        //#Push a character key such as "A"
        cy.get('body').type('A');

        //#Expect to have "A" value in main input
        cy.get('#post_textbox').should('be.focused');

        //#Click the @ icon to open the Recent mentions RHS to move the focus out of the main input box
        cy.get('#channelHeaderMentionButton').click({force: true});
        cy.get('#post_textbox').should('not.be.focused');

        //#Push a character key such as "B"
        cy.get('body').type('B');
        cy.get('#post_textbox').should('be.focused');
    });

    it('M17449 - Focus will move to main input box after a new channel has been opened', () => {
        //# Click on Town-Square channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Post a new message
        cy.postMessage('new post');

        //# Open the reply thread on the most recent post on Town-Square channel
        cy.clickPostCommentIcon();

        //# Place the focus inside the RHS input box
        cy.get('#reply_textbox').focus().should('be.focused');

        //# Use CTRL+K or CMD+K to open the channel switcher depending on OS
        cy.typeCmdOrCtrl().type('K', {release: true});

        //* Verify channel switcher is visible
        cy.get('#quickSwitchHint').should('be.visible');

        //# Type channel name 'Off-Topic' and select it
        cy.get('#quickSwitchInput').type('Off-Topic').wait(TIMEOUTS.TINY).type('{enter}');

        //* Verify that it redirected into selected channel 'Off-Topic'
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');

        //* Verify focus is moved to main input box when the channel is opened
        cy.get('#post_textbox').should('be.focused');
    });

    it('M17450 - Focus to remain in RHS textbox each time Reply arrow is clicked', () => {
        //# Click on Town-Square channel
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Post a new message
        cy.postMessage('new post');

        //# Open the reply thread on the most recent post on Town-Square channel
        cy.clickPostCommentIcon();

        //* Verify RHS textbox is focused the first time Reply arrow is clicked
        cy.get('#reply_textbox').should('be.focused');

        //# Focus away from RHS textbox
        cy.get('#rhsContent').click();

        //# Click reply arrow on post in same thread
        cy.clickPostCommentIcon();

        //* Verify RHS textbox is again focused the second time, when already open
        cy.get('#reply_textbox').should('be.focused');
    });

    it('M17452 Focus does not move when it has already been set elsewhere', () => {
        let channel;

        cy.getCurrentTeamId().then((teamId) => {
            // # Create new test channel
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                channel = res.body;

                // # Select the channel on the left hand side
                cy.get(`#sidebarItem_${channel.name}`).click({force: true});

                // * Channel's display name should be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', channel.display_name);

                // # Verify Focus in add channel member modal
                verifyFocusInAddChannelMemberModal();
            });
        });
    });
    it('M17455 - Focus does not move for non-character keys', () => {
        //# Make sure main input is visible and focused
        cy.get('#post_textbox').should('be.visible').and('be.focused');

        //#Click anywhere in the body to move the focus out of the main input box
        cy.get('body').click();

        //# Make sure main input is not focused
        cy.get('#post_textbox').should('not.be.focused');

        // Keycodes for keys that don't have a special character sequence for cypress.type()
        const numLockKeycode = 144;
        const f7Keycode = 118;
        const windowsKeycode = 91;

        [numLockKeycode, f7Keycode, windowsKeycode].forEach((keycode) => {
            //# Trigger keydown event using keycode
            cy.get('body').trigger('keydown', {keyCode: keycode, which: keycode});

            //# Make sure main input is not focused
            cy.get('#post_textbox').should('not.be.focused');
        });

        // For other keys we can use cypress.type() with a special character sequence.
        ['{downarrow}', '{pagedown}', '{shift}', '{pageup}', '{enter}'].forEach((key) => {
            //# Type special character key using Cypress special character sequence
            cy.get('body').type(key);

            //# Make sure main input is not focused
            cy.get('#post_textbox').should('not.be.focused');
        });
    });
});
