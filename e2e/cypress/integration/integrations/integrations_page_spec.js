// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    let team;

    before(() => {
        // # Login, create incoming webhook for Team A
        cy.apiInitSetup().then(({team, channel}) => {
            team = team.name;
        });
    });

    it('MM-T569 Integrations Page', () => {
        // # Visit Test Team B Incoming Webhooks page
        cy.visit(`/${team}/integrations`);

        // # Shrink the page
        cy.viewport('iphone-x');
    });
});