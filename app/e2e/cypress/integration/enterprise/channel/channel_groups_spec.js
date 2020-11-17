// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @ldap_group

import {getRandomId} from '../../../utils';

describe('channel groups', () => {
    let teamID;
    const groups = [];
    let teamName;

    before(() => {
        cy.apiRequireLicenseForFeature('LDAP');

        // # Link 2 groups
        cy.apiGetLDAPGroups().then((result) => {
            for (let i = 0; i < 2; i++) {
                cy.apiLinkGroup(result.body.groups[i].primary_key).then((response) => {
                    groups.push(response.body);
                });
            }
        });

        cy.apiUpdateConfig({LdapSettings: {Enable: true}, ServiceSettings: {EnableTutorial: false}});

        cy.apiLogin({username: 'board.one', password: 'Password1'}).then(({user}) => {
            cy.apiSaveCloudOnboardingPreference(user.id, 'hide', 'true');
        });

        // # Create a new team and associate one group to the team
        teamName = `team-${getRandomId()}`;
        cy.createNewTeam(teamName, teamName);
        cy.getCurrentTeamId().then((id) => {
            cy.apiLinkGroupTeam(groups[0].id, id);
            teamID = id;
        });

        // # Visit a channel
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Group-constrain the channel
        cy.getCurrentChannelId().then((id) => {
            cy.apiPatchChannel(id, {group_constrained: true});
        });
    });

    after(() => {
        cy.apiAdminLogin();
        cy.apiDeleteTeam(teamID, true);
        for (let i = 0; i < 2; i++) {
            cy.apiUnlinkGroup(groups[i].remote_id);
        }
        cy.apiUpdateConfig({LdapSettings: {Enable: false}, ServiceSettings: {EnableTutorial: true}});
    });

    it('limits the listed groups if the parent team is group-constrained', () => {
        // # Open the Add Groups modal
        openAddGroupsToChannelModal();

        // * Ensure at least 2 groups are listed
        let beforeCount;
        cy.get('#addGroupsToChannelModal').find('.more-modal__row').then((items) => {
            beforeCount = Cypress.$(items).length;
        });
        cy.get('#addGroupsToChannelModal').find('.more-modal__row').its('length').should('be.gte', 2);

        // # Group-constrain the parent team
        cy.apiAdminLogin();
        cy.apiPatchTeam(teamID, {group_constrained: true});
        cy.apiLogin({username: 'board.one', password: 'Password1'});
        cy.visit(`/${teamName}/channels/off-topic`);

        // # Close and re-open the Add Groups modal again
        openAddGroupsToChannelModal();

        // * Ensure that only 1 group is listed
        cy.get('#addGroupsToChannelModal').find('.more-modal__row').then((items) => {
            const newCount = beforeCount - 1;
            expect(items).to.have.length(newCount);
        });
    });
});

function openAddGroupsToChannelModal() {
    cy.get('#channelHeaderTitle').click();
    cy.get('#channelManageGroups').should('be.visible');
    cy.get('#channelManageGroups').click();
    cy.findByText('Add Groups').should('exist');
    cy.findByText('Add Groups').click();
    cy.get('#addGroupsToChannelModal').should('be.visible');
}
