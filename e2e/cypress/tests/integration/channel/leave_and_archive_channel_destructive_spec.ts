// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

describe('Leave and Archive channel actions display as destructive', () => {
    let testUser;
    let offTopicUrl;

    before(() => {

        // # Login as test user and visit off-topic channel
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            testUser = user;
            offTopicUrl = url;

            cy.apiLogin(testUser);
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T4943_1 Leave and Archive channel actions display as destructive in the channel dropdown menu', () => {
        // # Post a message in the channel
        cy.postMessage('These tests are written by Abi Vihan');

        // Click on the channel name to open menu dropdown
        cy.get('#channelHeaderTitle').should('be.visible').click();

        // verify that the first option in the menu is 'View Info'
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('View Info');
        // })
        cy.findByText('View Info').should('be.visible')       
        
        
        // press tab() for next option in the menu i.e. 'Move to...'
        // 'Move to...' opens a sub-menu
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Move to...');
        // }).type('{enter}');
        cy.findByText('Move to...').should('be.visible')
        
        
        // verify all its options in the sub-menu
        // verify first option in the sub-menu i.e.'Favorites'
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Favorites');
        // })
        // cy.findByText('Favorites').should('be.visible')
        
        
        // press tab() for next option in the sub-menu i.e.'Channels'
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Channels');
        // })
        // cy.findByText('Channels').should('be.visible')
        
        
        // pressing tab() here would take the focus to the border-divider in the sub-menu
        // cy.focused().tab();
        // .type('{tab}')  
        // cy.findByText('New Category').should('be.visible')

        // press tab() for next option in the sub-menu i.e.'New Category'
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('New Category');
        // })

        // all 3 options in the sub-menu have been verified
        // press tab() to take the focus back to the main menu
        // verifiy next option in the menu i.e.'Notification Preferences'
        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Notification Preferences');
        // })
        cy.findByText('Notification Preferences').should('be.visible')

        cy.findByText('Mute Channel').should('be.visible')
        cy.findByText('Add Members').should('be.visible')


        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Mute Channel');
        // })

        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Add Members');
        // })

        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Manage Members');
        // })
        cy.findByText('Manage Members').should('be.visible')


        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Edit Channel Header');
        // })
        cy.findByText('Edit Channel Header').should('be.visible')

        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Edit Channel Purpose');
        // })

        // cy.focused().tab().then(text => {
        //     expect(text).to.contain('Rename Channel');
        // })
        cy.findByText('Rename Channel').should('be.visible')

        // cy.findByText('Archive Channel').should('be.visible').trigger('mouseover', {force: true})
        cy.get('#channelArchiveChannel').should('be.visible').trigger('mouseover', {force: true});


        // // cy.focused().tab().then(text => {
        // //     expect(text).to.contain('Archive Channel');
        // // }).trigger('mouseover').should('have.css', 'background-color').and('eq', '#d24b4e')

        // // cy.findByText('Archive Channel').invoke('show').trigger('mouseover')
        // // cy.get('.MenuItem__dangerous').should('have.css', 'background-color').and('eq', '#d24b4e')
        // // cy.get('[aria-label="Archive Channel dialog"]').trigger('mouseover')
        // cy.get('#channelArchiveChannel').trigger('mouseover')
    });
});
