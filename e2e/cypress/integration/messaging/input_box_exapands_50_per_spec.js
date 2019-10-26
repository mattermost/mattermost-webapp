// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Input box expands upto 50 % only', () => {
    before(() => {
        // # Login and navigate to town-square
        cy.toMainChannelView('user-1');
    });

    it(' M18709 - Input box expands upto 50 % of total screen size', () => {
        // # get viewHeiht to compare
        const viewHeight = Cypress.config('viewportHeight');

        // # type  \n until the textbox reachs to max height.
        for (let index = 0; index < 30; index++) {
            cy.get('#post_textbox').type('\n');
        }

        // #  assert  that post_textbox's height is 40 less than viewHeight as per logic in src/mattermost-webapp/sass/layout/_post.scss line 383
        cy.get('#post_textbox').should(($el) => {
            expect($el).to.have.css('height', `${(viewHeight / 2) - 40}px`);
        });
    });
});
