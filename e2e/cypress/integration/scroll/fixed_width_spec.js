// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @scroll

describe('Scroll', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    beforeEach(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });
    });

    it('MM-T2368 Fixed Width', () => {
  
        // Creating some post to verify scroll pop and Posts views
        Cypress._.times(20, (postIndex) => {
            cy.postMessage(`p-${postIndex + 1}`);
        });
         // # Switch the account settings for the test user to enable Fixed width center 
         cy.get(".channel-intro-profile > .user-popover").scrollIntoView()
         cy.get('#headerInfo > .style--none').click()
         cy.get('#accountSettings > .style--none > .MenuItem__primary-text').click()
         cy.get('#accountSettingsModalLabel > span').should('contain', 'Account Settings')
         cy.get('#displayButton', { timeout: 500000 }).click()
         cy.get('#channel_display_modeEdit > span').click()
         cy.get('#settingTitle > span').should('contain', 'Channel Display')
         cy.get(':nth-child(3) > label').should('contain', 'Fixed width, centered').click()
         cy.get('#saveSetting').click()
         cy.get('#accountSettingsHeader > .close > [aria-hidden="true"]').click()
 
         // # Browser Channel
         cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        
         // * Verify No scroll pop is visible
         cy.get(".channel-intro-profile > .user-popover").should('be.visible')
 
         // * Verify All posts are displayed correctly
         cy.get('.post__img > .status-wrapper > .profile-icon').eq(0).should('be.visible')
         cy.get('.col.col__name').eq(0).should('be.visible')
         cy.get('.post__header--info').eq(0).should('be.visible')
         cy.get('textarea#post_textbox').eq(0).should('be.visible')
         cy.get('.post-action.style--none').eq(0).should('be.visible')
         cy.get('.emoji-picker__container.post-action').eq(0).should('be.visible')

        
    });
});


