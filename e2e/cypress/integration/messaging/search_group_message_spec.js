// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('should returns results in GMs', () => {
        cy.get('moreDirectMessage').click();

    });
});
