// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding @cloud

describe('Cloud Onboarding - Sysadmin invite members by email for legacy cloud plans with user limit', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {EnableOnboardingFlow: true},
        });

        cy.apiRequireLicenseForFeature('Cloud');

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
            'download_apps',
            'hide',
            'skip',
        ];

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);
    });

    it('MM-T3332_3 Invite more than user limit', () => {
        cy.intercept('GET', '/api/v4/cloud/subscription/stats', {
            statusCode: 200,
            body: {
                remaining_seats: 10,
                is_paid_tier: 'false',
            },
        });

        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').scrollIntoView().should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('a@b.c,b@c.d,c@d.e,d@e.f,e@f.g,f@g.h,g@h.i,h@i.j,i@j.k,j@k.l,k@l.m,', {force: true});

        cy.apiGetConfig().then(({config}) => {
            cy.get('.InviteMembersStep__invitationResults').should('contain', `The free tier is limited to ${config.ExperimentalSettings.CloudUserLimit} members.`);
        });

        // * Verify that Send button is disabled until only 10 emails remain
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Remove the last email
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('{backspace}');

        // * Verify that Send button is now enabled
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled');
    });
});
