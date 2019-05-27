// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] in dicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 5]*/

describe('Add user to a channel', () => {
    it('CS15445 Join/leave messages (including combined): Usernames are links, open profile popovers', () => {
        // # Login as 'user-1' and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Select 'doloremque' channel on the left hand side
        cy.get('#sidebarItem_saepe-5').click();

        // * 'doloremque' shoul be visible at the top of the center pane
        cy.get('#channelHeaderTitle').should('contain', 'doloremque');

        // # Then click it to access the drop-down menu
        cy.get('#channelHeaderTitle').click();

        // * The dropdown menu of te channel header should be visible;
        cy.get('#channelHeaderDropdownMenu').should('be.visible');

        // # Click 'Add Members'
        cy.get('#channelAddMembers').click();

        // * Assert that modal appears
        cy.get('#addUsersToChannelModal').should('be.visible');

        // # Wait 1 second
        cy.wait(1000);// eslint-disable-line

        // # Click the first row clickable of the modal to select a user
        cy.get('#userAddList').first().click();

        // # Click the button "Add" to add this user to 'doloremque' channel
        cy.get('#saveItems').click();

        cy.getLastPostId().then((id) => {
            // # On the system message advising a user was added to the channel, click the username link
            cy.get(`#post_${id}`).find('.mention-link').first().click({force: true}).then(($el) => {
                // * Then the user's profile pop-over should be displayed when their username is clicked, and the pop-over is fully visible
                cy.get('#user-profile-popover').should('be.visible');

                // * The pop-over title  at the top of the pop-over should be the same as the username link
                const userName = $el[0].innerHTML;
                const escapedUsername = userName.replace('@', '').replace('.', '-');
                cy.get(`#userPopoverUserName-${escapedUsername}`).should('contain', userName);
            });
        });

        // # Select 'sint', another channel on the left hand side
        cy.get('#sidebarItem_suscipit-4').click();

        // # Click 'sint' at the top of the center pane to access the drop-down menu
        cy.get('#channelHeaderTitle').click();

        // * The dropdown menu of the 'sint' channel header should be visible;
        cy.get('#channelHeaderDropdownMenu').should('be.visible');

        // # Click 'Add Members'
        cy.get('#channelAddMembers').click({});

        // * Assert that modal appears
        cy.get('#addUsersToChannelModal').should('be.visible');

        // # Click 3 times the first row clickable of the modal to select 3 different users
        cy.get('#userAddList').first().click();
        cy.get('#userAddList').first().click();
        cy.get('#userAddList').first().click();

        // # Click the button "Add" to add these 3 users to 'sint' channel
        cy.get('#saveItems').click();

        // # Wait 2 seconds to allow the popup to disappear
        cy.wait(2000); // eslint-disable-line

        cy.getLastPostId().then((id) => {
            // # On the system message advising users were added to the channel (combined) that includes a link such as "and 2 others", click to expand the usernames
            cy.get(`#post_${id}`).find('.markdown__paragraph-inline').siblings('a').first().click().then(() => {
                cy.get(`#post_${id}`).find('.markdown__paragraph-inline').first().find('.mention-link').each(($el) => {
                    // # Then click each username link
                    cy.wrap($el).click();

                    // * The profile pop-over of each user should be displayed when their username is clicked, and the pop-over is fully visible
                    const userName = $el[0].innerHTML;
                    cy.get('#user-profile-popover').should('be.visible');

                    // * The pop-over title  at the top of the pop-over should be the same as the username link for each user
                    const escapedUsername = userName.replace('@', '').replace('.', '-');
                    cy.get(`#userPopoverUserName-${escapedUsername}`).should('contain', userName);
                });
            });
        });
    });
});