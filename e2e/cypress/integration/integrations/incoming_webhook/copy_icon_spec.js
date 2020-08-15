// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Incoming webhook', () => {
    let testTeam;

    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableIncomingWebhooks: true,
            },
        };

        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Go to integrations
            cy.visit(`/${testTeam.name}/integrations`);

            // * Validate that incoming webhooks are enabled
            cy.get('#incomingWebhooks').should('be.visible');
        });
    });

    it('MM-T637 Copy icon for Incoming Webhook URL', () => {
        const title = 'test-title';
        const description = 'test-description';
        const channel = 'Town Square';

        cy.get('#incomingWebhooks').click();

        cy.get('#addIncomingWebhook').click();

        cy.get('#displayName').type(title);

        cy.get('#description').type(description);

        cy.get('#channelSelect').select(channel);

        cy.get('#saveWebhook').click();

        cy.get('#formTitle').should('have.text', 'Setup Successful');

        copyIconIsVisible('.backstage-form__confirmation');

        cy.get('#doneButton').click();

        copyIconIsVisible('.item-details__url');
    });
});

function copyIconIsVisible(element) {
    cy.get(element).within(() => {
        cy.get('a[href="#"]').should('be.visible');
    });
}
