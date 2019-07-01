// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 6]*/

const channelDisplayNameTest1 = 'Channel test 1';
const channelDisplayNameTest2 = 'Channel test 2';
let channelTest1Id;
let channelTest2Id;

function deleteCurrentChannel() {
    cy.getCurrentChannelId().then((channelId) => {
        cy.apiDeleteChannel(channelId);
    });
}

function verifyMentionedUserAndProfilePopover(postId) {
    cy.get(`#post_${postId}`).find('.mention-link').each(($el) => {
        // # Click each username link
        cy.wrap($el).click();

        // * The profile pop-over of each user should be displayed when their username is clicked, and the pop-over is fully visible
        const userName = $el[0].innerHTML;
        cy.get('#user-profile-popover').should('be.visible');

        // * The pop-over title  at the top of the pop-over should be the same as the username link for each user
        const escapedUsername = userName.replace('@', '').replace('.', '-');
        cy.get(`#userPopoverUserName-${escapedUsername}`).should('contain', userName);
    });
}

function addUsersToChannel(amount) {
    for (let i = 0; i < amount; i++) {
        cy.get('#multiSelectList').first().click();
    }
}

describe('Add user to a channel', () => {
    afterEach(() => {
        deleteCurrentChannel();
    });

    it('Single User: Usernames are links, open profile popovers', () => {
        // # Login as 'user-1', go to / and create 'Channel test 1'
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, 'channel-test-1', channelDisplayNameTest1).then((res) => {
                channelTest1Id = res.body.name;

                // # Select 'Channel test 1' channel on the left hand side
                cy.get(`#sidebarItem_${channelTest1Id}`).click();

                // * 'Channel test 1' shoul be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', 'Channel test 1');

                // # Then click it to access the drop-down menu
                cy.get('#channelHeaderTitle').click();

                // * The dropdown menu of the channel header should be visible;
                cy.get('#channelHeaderDropdownMenu').should('be.visible');

                // # Click 'Add Members'
                cy.get('#channelAddMembers').click();

                // * Assert that modal appears
                cy.get('#addUsersToChannelModal').should('be.visible');

                // # Click the first row clickable of the modal to select a user
                addUsersToChannel(1);

                // # Click the button "Add" to add this user to 'Channel test 1' channel
                cy.get('#saveItems').click();

                // # Wait for the modal to disappear
                cy.get('#addUsersToChannelModal').should('not.exist');

                cy.getLastPostId().then((id) => {
                    // * The system message should contain 'added to the channel by you'
                    cy.get(`#postMessageText_${id}`).should('contain', 'added to the channel by you');

                    // # Verify username link
                    verifyMentionedUserAndProfilePopover(id);
                });
            });
        });
    });

    it('Combined Users: Usernames are links, open profile popovers', () => {
        cy.getCurrentTeamId().then((teamId) => {
            // # Create 'Channel test 2'
            cy.apiCreateChannel(teamId, 'channel-test-2', channelDisplayNameTest2).then((res) => {
                channelTest2Id = res.body.name;

                // # Select 'Channel test 2' channel on the left hand side
                cy.get(`#sidebarItem_${channelTest2Id}`).click();

                // * 'Channel test 2' should be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', 'Channel test 2');

                // # Then click it to access the drop-down menu
                cy.get('#channelHeaderTitle').click();

                // * The dropdown menu of the channel header should be visible;
                cy.get('#channelHeaderDropdownMenu').should('be.visible');

                // # Click 'Add Members'
                cy.get('#channelAddMembers').click();

                // * Assert that the modal appears
                cy.get('#addUsersToChannelModal').should('be.visible');

                // # Click 3 times the first row clickable of the modal to select 3 different users
                addUsersToChannel(3);

                // # Click the button "Add" to add these 3 users to 'Channel test 2' channel
                cy.get('#saveItems').click();

                // # Wait for the modal to disappear
                cy.get('#addUsersToChannelModal').should('not.exist');

                cy.getLastPostId().then((id) => {
                    cy.get(`#postMessageText_${id}`).should('contain', '2 others were added to the channel by you');

                    // # Click "2 others" to expand more users
                    cy.get(`#post_${id}`).find('.markdown__paragraph-inline').siblings('a').first().click().then(() => {
                        // # Verify each username link
                        verifyMentionedUserAndProfilePopover(id);
                    });
                });
            });
        });
    });
});