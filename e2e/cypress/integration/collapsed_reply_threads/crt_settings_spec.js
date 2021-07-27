// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('CRT Settings', () => {
    let testTeam;
    let testChannel;

    before(() => {
        cy.apiInitSetup({loginAfter: true, promoteNewUserAsAdmin: true}).then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
        });
    });

    beforeEach(() => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('should be able to toggle CRT on/off', () => {
        cy.uiChangeCRTDisplaySetting('OFF');

        cy.get('.SidebarGlobalThreads').should('not.exist');

        cy.uiChangeCRTDisplaySetting('ON');

        cy.get('.SidebarGlobalThreads').should('exist');

        cy.get('.SidebarGlobalThreads').should('be.visible');

        cy.visit(`/${testTeam.name}/threads`);
        cy.get('h2').should('have.text', 'Followed threads');
    });
});
