// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Mention self', () => {
    let testUser;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('should be always highlighted', () => {
        [
            `@${testUser.username} `,
            `@${testUser.username}. `,
            `@${testUser.username}_ `,
            `@${testUser.username}- `,
            `@${testUser.username}, `,
        ].forEach((message) => {
            cy.postMessage(message);

            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).find('.mention--highlight');
            });
        });
    });
});
