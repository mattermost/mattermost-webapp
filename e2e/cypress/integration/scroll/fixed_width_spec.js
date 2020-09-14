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
        // # Post a starting message with user 1
        cy.postMessage('This is the first post');

        // # Make enough posts so that first post is scrolled past hidden
        Cypress._.times(30, (postIndex) => {
            cy.postMessage(`p-${postIndex + 1}`);
        });

         //setting the scrollbar at Title
         cy.get(".channel-intro-profile > .user-popover").scrollIntoView()
  
         //click on Menu
         cy.get('#headerInfo > .style--none').click()
 
         //Click on Acc Settings
         cy.get('#accountSettings > .style--none > .MenuItem__primary-text').click()
 
         //Verify Acc Settings Window launched
         cy.get('#accountSettingsModalLabel > span').should('contain', 'Account Settings')
 
         //Click on Display with timeout limit as page is loading slowly here
         cy.get('#displayButton', { timeout: 500000 }).click()
   
         //Click on Edit
         cy.get('#channel_display_modeEdit > span').click()
 
         //verify the title Channel display
         cy.get('#settingTitle > span').should('contain', 'Channel Display')
 
         //Click on Fixed width, centered
         cy.get(':nth-child(3) > label').should('contain', 'Fixed width, centered').click()
 
         //Save
         cy.get('#saveSetting').click()
 
         //Close window
         cy.get('#accountSettingsHeader > .close > [aria-hidden="true"]').click()
 
         //Assert if element scroll pop
         cy.get(".channel-intro-profile > .user-popover").should('be.visible')
 
         //Assert if all elements are visbile correctly
         cy.get('.post__img > .status-wrapper > .profile-icon').eq(0).should('be.visible')
         cy.get('.col.col__name').eq(0).should('be.visible')
         cy.get('.post__header--info').eq(0).should('be.visible')
         cy.get('textarea#post_textbox').eq(0).should('be.visible')
         cy.get('.post-action.style--none').eq(0).should('be.visible')
         cy.get('.emoji-picker__container.post-action').eq(0).should('be.visible')

        
    });
});


