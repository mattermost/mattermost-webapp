// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message Draft with attachment and Switch Channels', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });
    const channelName1 = `test-channel-1-${Date.now()}`;
    const channelName2 = `test-channel-2-${Date.now()}`;
    let testChannel1;
    let testChannel2;

    it('M14126 Message Draft Pencil Icon - No text, only file attachment', () => {
        // # Create new test channel
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiCreateChannel(teamId, channelName1, channelName1, 'O', 'Test channel').then((response) => {
                testChannel1 = response.body;
                cy.get(`#sidebarItem_${testChannel1.name}`).click({force: true});

                // # Validate if the channel has been opened
                cy.url().should('include', '/channels/' + testChannel1.name);

                // # Validate if the draft icon is not visible on the sidebar before making a draft
                cy.get(`#sidebarItem_${testChannel1.name} #draftIcon`).should('be.not.visible');

                // # Upload a file on center view
                cy.fileUpload('#fileUploadInput');
            });

            cy.apiCreateChannel(teamId, channelName2, channelName2, 'O', 'Test channel').then((response) => {
                testChannel2 = response.body;

                // # Go to test channel without submitting the draft in the previous channel
                cy.get(`#sidebarItem_${testChannel2.name}`).click({force: true});

                // # Validate if the newly navigated channel is open
                cy.url().should('include', '/channels/' + testChannel2.name);

                // # Validate if the draft icon is visible in side bar for the previous channel
                cy.get(`#sidebarItem_${testChannel1.name} #draftIcon`).scrollIntoView().should('be.visible');
            });
        });
    });
});
