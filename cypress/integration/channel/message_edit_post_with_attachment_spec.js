// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message Draft', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('Pasted text should be pasted where the cursor is', () => {
        // 1. Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').should('be.visible').click({force:true});

        // * Validate if the channel has been opened
        cy.url().should('include', '/ad-1/channels/town-square');

        //2. Type in some text into the text area of the opened channel


        //3. Add attachment
        cy.uploadFile('#fileUploadButton input','../fixtures/mattermost-icon.png','image/png');

        cy.get('#post_textbox').type('This is sample text').should('contain','This is sample text');

        cy.get('#create_post').submit();

        // find last post
        // cy.contains('div.post-message__text p', 'This is sample text').parents('div.post__content')
        // .trigger('mouseover')
        // .find('div.dropdown').should('be.visible');

        // cy.contains('div.post-message__text p', 'This is sample text').last().parents('div.post__content')
        //     .within((el)=>{
        //         cy.get('.col__reply').trigger('mouseover');
        //         cy.get('div.dropdwon').should('be.visible');
        //         cy.contains('button span','Edit').should('be.visible');
        // });
        cy.get('#postListContent').find('.post').last().within(function($el) {
            cy.contains('div.post-message__text p', 'This is sample text').should('be.visible');
            cy.wrap($el).trigger('mouseenter');
            cy.wrap($el).trigger('hover');
            cy.get('.dropdown').should('be.visible');
            // cy.get('div.dropdown').should('be.visible');
            cy.contains('span','Edit').click();
        });


        //3. Post message
        // cy.get('#create_post').submit();
        //
        // //3. Go to another test channel without submitting the draft in the previous channel
        // cy.get('#sidebarItem_ratione-1').should('be.visible').click();
        //
        // //* Validate if the newly navigated channel is open
        // cy.url().should('include', '/ad-1/channels/ratione-1');
        //
        // //* Validate if the draft icon is visible on side bar on the previous channel with a draft
        // cy.get('#sidebarItem_town-square #draftIcon').should('be.visible');
    });
});
