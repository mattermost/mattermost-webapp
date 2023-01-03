// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// e.g. not_cloud cloud because we always want to exclude running automatically
// until we create the special self-hosted run setup
// Stage: @prod
// Group: @enterprise @not_cloud @cloud


describe('Self hosted Purchase', () => {
  it('happy path, can purchase a license and have it applied automatically', () => {
    let urlL: string | undefined;
    let createdUser: Cypress.UserProfile | undefined;

    before(() => {
        cy.apiInitSetup().then(({user, offTopicUrl: url}) => {
            urlL = url;
            createdUser = user;
            cy.apiAdminLogin();
            cy.apiDeleteLicense();
            cy.visit(url);
        });
    });
  })
});
