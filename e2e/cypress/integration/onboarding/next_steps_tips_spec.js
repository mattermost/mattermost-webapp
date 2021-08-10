// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @onboarding

describe('Onboarding - Next Steps Tips', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            townSquarePage = `/${team.name}/channels/town-square`;
        });

        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and set all steps to false
        const preference = {
            user_id: sysadmin.id,
            category: 'recommended_next_steps',
            value: 'false',
        };
        const adminSteps = [
            'complete_profile',
            'notification_setup',
            'team_setup',
            'invite_members',
            'enter_support_email',
            'hide',
            'skip',
        ];

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);

        cy.get('.NextStepsView__button:contains(Skip Getting Started)').scrollIntoView().should('be.visible').click();
    });

    it('Should not show incident collaboration', () => {
        // * Check that Next Steps page shows
        cy.get('span').contains('Tips & Next Steps');

        cy.findByText('Resolve incidents faster with Mattermost Incident Collaboration.').should('not.exist');
    });
});
