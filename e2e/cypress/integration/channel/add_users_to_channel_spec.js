// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel @channel_settings @smoke

function verifyMentionedUserAndProfilePopover(postId) {
    cy.get(`#post_${postId}`).find('.mention-link').each(($el) => {
        // # Get username from each mentioned link
        const userName = $el[0].innerHTML;

        // # Click each username link
        cy.wrap($el).click();

        // * Profile popover should be visible
        cy.get('#user-profile-popover').should('be.visible');

        // * The popover title  at the top of the popover should be the same as the username link for each user
        cy.findByTestId(`profilePopoverTitle_${userName.replace('@', '')}`).should('contain', userName);

        // Click anywhere to close profile popover
        cy.get('#channelHeaderInfo').click();
    });
}

function addNumberOfUsersToChannel(num = 1) {
    // # Then click it to access the drop-down menu
    cy.get('#channelHeaderTitle').click();

    // * The dropdown menu of the channel header should be visible;
    cy.get('#channelLeaveChannel').should('be.visible');

    // # Click 'Add Members'
    cy.get('#channelAddMembers').click();

    // * Assert that modal appears
    // # Click the first row for a number of times
    Cypress._.times(num, () => {
        cy.get('#multiSelectList').should('be.visible').first().click();
    });

    // # Click the button "Add" to add user to a channel
    cy.get('#saveItems').click();

    // # Wait for the modal to disappear
    cy.get('#addUsersToChannelModal').should('not.exist');
}

describe('CS15445 Join/leave messages', () => {
    let testTeam;
    let firstUser;
    let addedUsersChannel;
    let username;
    const usernames = [];

    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            firstUser = user;

            // # Add 4 users
            for (let i = 0; i < 4; i++) {
                cy.apiCreateUser().then(({user: newUser}) => { // eslint-disable-line
                    cy.apiAddUserToTeam(testTeam.id, newUser.id);
                });
            }
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then(({channel}) => {
                addedUsersChannel = channel;
            });

            cy.apiLogin(firstUser);
        });
    });

    it('Single User: Usernames are links, open profile popovers', () => {
        // # Create and visit new channel
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then(({channel}) => {
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // # Add users to channel
            addNumberOfUsersToChannel(1);

            cy.getLastPostId().then((id) => {
                // * The system message should contain 'added to the channel by you'
                cy.get(`#postMessageText_${id}`).should('contain', 'added to the channel by you');

                // # Verify username link
                verifyMentionedUserAndProfilePopover(id);
            });
        });
    });

    it('Combined Users: Usernames are links, open profile popovers', () => {
        // # Create and visit new channel
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then(({channel}) => {
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            addNumberOfUsersToChannel(3);

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

    it('MM-T856_1 Add existing users to public channel from drop-down > Add Members', () => {
        // # Visit the add users channel
        cy.visit(`/${testTeam.name}/channels/${addedUsersChannel.name}`);

        // # Click 'Add Members'
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelAddMembers').click();

        // # First add one user in order to see them disappearing from the list
        cy.get('#multiSelectList > div').first().then((el) => {
            const childNodes = Array.from(el[0].childNodes);
            childNodes.map((child) => usernames.push(child.innerText));

            // # Get username from text for comparison
            username = usernames.toString().match(/@\w+/g)[0];
            cy.get('#multiSelectList').should('contain', username);

            // # Click to add the first user
            cy.wrap(el).click();

            // # Verify username does not exist in the users list
            cy.get('#multiSelectList').should('not.contain', username);

            // # Save and exit modal
            cy.get('#saveItems').click();
            cy.get('#addUsersToChannelModal').should('not.exist');
        });

        // # Verify that the last system post also contains the username
        cy.getLastPostId().then((id) => {
            cy.get(`#postMessageText_${id}`).should('contain', `${username} added to the channel by you.`);
        });

        // Add two more users
        addNumberOfUsersToChannel(2);

        // Verify that the system post reflects the number of added users
        cy.getLastPostId().then((id) => {
            cy.get(`#postMessageText_${id}`).should('contain', 'added to the channel by you');
        });
    });

    it('MM-T856_2 Existing users cannot be added to public channel from drop-down > Add Members', () => {
        cy.apiAdminLogin();

        // # Visit the add users channel
        cy.visit(`/${testTeam.name}/channels/${addedUsersChannel.name}`);

        // # Verify that the system message for adding users displays
        cy.getLastPostId().then((id) => {
            cy.get(`#postMessageText_${id}`).should('contain', `added to the channel by @${firstUser.username}`);
        });

        // Visit off topic where all users are added
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Click 'Add Members'
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelAddMembers').click();

        // # Verify users list does not exist
        cy.get('#multiSelectList').should('not.exist');
        cy.get('body').type('{esc}');
    });
});
