// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function verifyFocusInAddChannelMemberModal() {
    // # Click to access the Channel menu
    cy.get('#channelHeaderTitle').click();

    // * The dropdown menu of the channel header should be visible;
    cy.get('#channelHeaderDropdownMenu').should('be.visible');

    // # 1. Click 'Add Members'
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
        cy.get('#channelHeaderMentionButton').click();
        cy.get('#post_textbox').should('not.be.focused');

        //#Push a character key such as "B"
        cy.get('body').type('B');
        cy.get('#post_textbox').should('be.focused');
    });

    it('M47742 Focus does not move when it has already been set elsewhere', () => {
        let channel;

        cy.getCurrentTeamId().then((teamId) => {
            // # Create new test channel
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                channel = res.body;

                // # Select the channel on the left hand side
                cy.get(`#sidebarItem_${channel.name}`).click();

                // * Channel's display name should be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', channel.display_name);

                // # Verify Focus in add channel member modal
                verifyFocusInAddChannelMemberModal();
            });
        });
    });
});
