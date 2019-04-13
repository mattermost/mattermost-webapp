// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Channel', () => {
    before(() => {
        // 1. Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    // * Verify new public or private channel cannot be created with existing public channel name:
    it('M14635 Should not create new channel with existing public channel name', () => {
        // 2. Find how many public channels there are and store as origPublicChannelLenth
        cy.get('#sidebarChannelContainer').children().contains('PUBLIC CHANNELS').parent().parent().siblings().its('length').then(($origPublicChannelLength) => {
            // * Verify new public channel cannot be created with existing public channel name:
            // 3. Verify channel with name 'Town Square' exists
            cy.get('#sidebarChannelContainer').should('contain', 'Town Square');

            // 4. Click on '+' button for Public Channel
            cy.get('#createPublicChannel').click();

            // 5. Type 'Town Square' in the input field for new public channel
            cy.get('#newPublicChannelName').type('Town Square');

            //6. Click 'Create New Channel' button
            cy.get('button[type=submit]').click();

            // * User gets a message saying "A channel with that name already exists on the same team"
            cy.get('p').contains('A channel with that name already exists on the same team');

            // 7. Click on Cancel button to move out of New Channel dialog
            cy.get('button').contains('Cancel').click();

            // * Verify new private channel cannot be created with existing public channel name:
            // 8. Click on '+' button for Private Channel
            cy.get('#createPrivateChannel').click();

            // 9. Type 'Town Square' in the input field for new private channel
            cy.get('#newPrivateChannelName').type('Town Square');

            // 10. Click 'Create New Channel' button
            cy.get('button[type=submit]').click();

            // * User gets a message saying "A channel with that name already exists on the same team"
            cy.get('p').contains('A channel with that name already exists on the same team');

            // * Verify the number of Public Channels is still the same as before (by comparing it to origPublicChannelLenth)
            cy.get('#sidebarChannelContainer').children().contains('PUBLIC CHANNELS').parent().parent().siblings().its('length').should('eq', $origPublicChannelLength);
        });

        // 11. Exit out of the New Channel dialog
        cy.get('button').contains('Cancel').click();
    });

    // * Verify new public or private channel cannot be created with existing private channel name:
    it('Should not create new channel with existing private channel name', () => {
        // 12. Find how many public channels there are and store as origPrivateChannelLenth
        cy.get('#sidebarChannelContainer').children().contains('PRIVATE CHANNELS').parent().parent().siblings().its('length').then(($origPrivateChannelLength) => {
            // * Verify new public channel cannot be created with existing private channel name:
            // 13. Verify a private channel
            cy.get('#sidebarItem_autem-2').should('contain', 'commodi');

            // 14. Click on '+' button for Public Channel
            cy.get('#createPublicChannel').click();

            // 15. Type 'commodi' in the input field for new public channel
            cy.get('#newPublicChannelName').type('commodi');

            // 16. Click 'Create New Channel' button
            cy.get('button[type=submit]').click();

            // * User gets a message saying "A channel with that name already exists on the same team"
            cy.get('p').contains('A channel with that name already exists on the same team');

            // 17. Click on Cancel button to move out of New Channel dialog
            cy.get('button').contains('Cancel').click();

            // * Verify new private channel cannot be created with existing private channel name:
            // 18. Click on '+' button for Private Channel
            cy.get('#createPrivateChannel').click();

            // 19. Type 'commodi' in the input field for new private channel
            cy.get('#newPrivateChannelName').type('commodi');

            // 20. Click 'Create New Channel' button
            cy.get('button[type=submit]').click();

            // * User gets a message saying "A channel with that name already exists on the same team"
            cy.get('p').contains('A channel with that name already exists on the same team');

            // * Verify the number of Private Channels is still the same as before (by comparing it to origPrivateChannelLenth)
            cy.get('#sidebarChannelContainer').children().contains('PRIVATE CHANNELS').parent().parent().siblings().its('length').should('eq', $origPrivateChannelLength);

            // 21. Exit out of the New Channel dialog
            cy.get('button').contains('Cancel').click();
        });
    });
});
