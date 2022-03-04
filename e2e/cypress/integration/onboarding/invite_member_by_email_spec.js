// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding

describe('Onboarding - Sysadmin invite members by email', () => {
    let teamId;
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {EnableOnboardingFlow: true},
        });

        cy.apiInitSetup().then(({team}) => {
            teamId = team.id;
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

    it('MM-T3332_1 Invite with valid email', () => {
        const emails = [
            'bill.s.preston@wyldstallyns.com',
            'theodore.logan@wyldstallyns.com',
            'joanna.preston@wyldstallyns.com',
            'elizabeth.logan@wyldstallyns.com',
        ];

        cy.intercept(`/api/v4/teams/${teamId}/invite/email?graceful=true`, (req) => {
            req.continue((res) => {
                // # Mock the response if email rate limit is exceeded
                if (res.body.id === 'app.email.rate_limit_exceeded.app_error') {
                    res.send(200, emails.map((email) => ({email})));
                }
            });
        });

        // * Make sure tips view has loaded
        cy.url().should('include', 'tips');

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // * Verify that Send button is disabled until emails are entered
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type(emails.join(','), {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that 4 invitations were sent
        cy.get('.InviteMembersStep__invitationResults').should('contain', `${emails.length} invitations sent`);
    });

    it('MM-T3332_2 Invite with invalid emails', () => {
        // * Make sure tips view has loaded
        cy.url().should('include', 'tips');

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodoreloganwyldstallynscom,', {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'One or more email addresses are invalid');
    });

    it('MM-T3332_3 Invite with invalid emails when next button is pressed', () => {
        // * Make sure tips view has loaded
        cy.url().should('include', 'tips');

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodoreloganwyldstallynscom,', {force: true});

        // # Click Finish button
        cy.findByTestId('InviteMembersStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'One or more email addresses are invalid');
    });

    it('MM-T3332_4 Pressing next with empty input finishes the step', () => {
        // * Make sure tips view has loaded
        cy.url().should('include', 'tips');

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Click Finish button
        cy.findByTestId('InviteMembersStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 5 steps complete');
    });
});
