// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.clearLocalStorage();
    });

    it('MM-18712 Large number of emoji reactions wrap into multiple lines', () => {
        //cy.get('#post_textbox').type(':cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: :cowboy_hat_face: {enter}')
        cy.postMessage(':dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog: :dog:');

        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).
               should('have.css', 'height', '64px');
        });
    }
    )
    ;
});
