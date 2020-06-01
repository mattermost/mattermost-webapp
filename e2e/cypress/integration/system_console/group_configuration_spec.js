// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function teamOrChannelIsPresent(name) {
    cy.get('.group-teams-and-channels-row').should('be.visible');
    cy.get('.group-teams-and-channels-row').findByText(name);
}

function addGroupSyncable(type, callback) {
    cy.get('#add_team_or_channel').should('be.visible');
    cy.get('#add_team_or_channel').click();
    cy.get('.dropdown-menu').find(`#add_${type}`).should('be.visible');
    cy.get('.dropdown-menu').find(`#add_${type}`).click();
    cy.get(`.${type}-selector-modal`).should('be.visible');
    cy.get('#multiSelectList').find('.more-modal__row').find(type === 'channel' ? '.channel-name' : '.title').then(($elements) => {
        const name = $elements[0].innerText;

        cy.get('#multiSelectList').find('.more-modal__row').first().click();
        cy.get('#saveItems').click();

        // * Check that the team or channel was added to the view
        teamOrChannelIsPresent(name);

        callback(name);
    });
}

function changeRole(name) {
    cy.get(`div[data-testid=${name}_current_role]`).click();
    cy.get(`#${name}_change_role_options`).find('button').click();
}

function savePage() {
    cy.get('#saveSetting').click();
    cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
}

function removeAndConfirm(name) {
    cy.get(`button[data-testid='${name}_groupsyncable_remove']`).click();
    cy.get('#confirmModalButton').should('be.visible');
    cy.get('#confirmModalButton').click();
    cy.get('.group-teams-and-channels-empty').should('be.visible');
}

describe('group configuration', () => {
    let groupID;

    beforeEach(() => {
        cy.requireLicenseForFeature('LDAP');

        // # Link a group
        cy.apiGetLDAPGroups().then((result) => {
            cy.apiLinkGroup(result.body.groups[0].primary_key).then((response) => {
                groupID = response.body.id;

                // # Login as sysadmin
                cy.apiLogin('sysadmin');

                // # Go to the group configuration view of the linked group
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that it has no associated teams or channels
                cy.get('.group-teams-and-channels-empty').should('be.visible');
            });
        });
    });

    afterEach(() => {
        cy.apiGetGroupTeams(groupID).then((response) => {
            response.body.forEach((item) => {
                cy.apiUnlinkGroupTeam(groupID, item.team_id);
            });
        });
        cy.apiGetGroupChannels(groupID).then((response) => {
            response.body.forEach((item) => {
                cy.apiUnlinkGroupChannel(groupID, item.channel_id);
            });
        });
    });

    describe('adding a team', () => {
        it('does not add a team without saving', () => {
            addGroupSyncable('team', () => {
                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team that was added dissappears
                cy.get('.group-teams-and-channels-empty').should('be.visible');
            });
        });

        it('does add a team when saved', () => {
            addGroupSyncable('team', (teamName) => {
                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // # Test that the team persisted
                teamOrChannelIsPresent(teamName);
            });
        });
    });

    describe('adding a channel', () => {
        it('does not add a channel without saving', () => {
            addGroupSyncable('channel', () => {
                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel that was added dissappears
                cy.get('.group-teams-and-channels-empty').should('be.visible');
            });
        });

        it('does add a channel when saved', () => {
            addGroupSyncable('channel', (channelName) => {
                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // # Test that the team persisted
                teamOrChannelIsPresent(channelName);
            });
        });
    });

    describe('removing a team', () => {
        it('does not remove a team without saving', () => {
            cy.apiGetTeams().then((response) => {
                // # Link a team
                const team = response.body[0];
                cy.apiLinkGroupTeam(groupID, team.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team was added to the view
                teamOrChannelIsPresent(team.display_name);

                // # Click remove and confirm
                removeAndConfirm(team.display_name);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team is still visible
                teamOrChannelIsPresent(team.display_name);
            });
        });

        it('does remove a team when saved', () => {
            cy.apiGetTeams().then((response) => {
                // # Link a team
                const team = response.body[0];
                cy.apiLinkGroupTeam(groupID, team.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team was added to the view
                teamOrChannelIsPresent(team.display_name);

                // # Click remove and confirm
                removeAndConfirm(team.display_name);

                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team is no longer present
                cy.get('.group-teams-and-channels-empty').should('be.visible');
            });
        });
    });

    describe('removing a channel', () => {
        it('does not remove a channel without saving', () => {
            cy.apiGetChannelByName('ad-1', 'aut-8').then((response) => {
                // # Link a channel
                const channel = response.body;
                cy.apiLinkGroupChannel(groupID, channel.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel was added to the view
                teamOrChannelIsPresent(channel.display_name);

                // # Click remove
                cy.get(`button[data-testid='${channel.display_name}_groupsyncable_remove']`).click();
                cy.get('#confirmModalButton').should('be.visible');
                cy.get('#confirmModalButton').click();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team is still visible
                teamOrChannelIsPresent(channel.display_name);
            });
        });

        it('does remove a channel when saved', () => {
            cy.apiGetChannelByName('ad-1', 'aut-8').then((response) => {
                // # Link a channel
                const channel = response.body;
                cy.apiLinkGroupChannel(groupID, channel.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel was added to the view
                teamOrChannelIsPresent(channel.display_name);
                cy.get('.group-teams-and-channels-row').should('have.length', 2);

                // # Click remove
                cy.get(`button[data-testid='${channel.display_name}_groupsyncable_remove']`).click();
                cy.get('#confirmModalButton').should('be.visible');
                cy.get('#confirmModalButton').click();

                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel is no longer present
                cy.get('.group-teams-and-channels-row').should('have.length', 1);
            });
        });
    });

    describe('updating a team role', () => {
        it('updates the role for a new team', () => {
            // # Add a new team
            addGroupSyncable('team', (teamName) => {
                // # Update the role
                changeRole(teamName);

                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${teamName}_current_role]`).findByText('Team Admin');
            });
        });

        it('updates the role for an existing team', () => {
            cy.apiGetTeams().then((response) => {
                // # Link a team
                const team = response.body[0];
                cy.apiLinkGroupTeam(groupID, team.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team was added to the view
                teamOrChannelIsPresent(team.display_name);

                // # Change the role
                changeRole(team.display_name);

                // # Save settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${team.display_name}_current_role]`).findByText('Team Admin');
            });
        });

        it('does not update the role if not saved', () => {
            cy.apiGetTeams().then((response) => {
                // # Link a team
                const team = response.body[0];
                cy.apiLinkGroupTeam(groupID, team.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team was added to the view
                teamOrChannelIsPresent(team.display_name);

                // # Change the role
                changeRole(team.display_name);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${team.display_name}_current_role]`).findByText('Member');
            });
        });

        it('does not update the role of a removed team', () => {
            cy.apiGetTeams().then((response) => {
                // # Link a team
                const team = response.body[0];
                cy.apiLinkGroupTeam(groupID, team.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the team was added to the view
                teamOrChannelIsPresent(team.display_name);

                // # Change the role
                changeRole(team.display_name);

                removeAndConfirm(team.display_name);

                // # Save settings
                savePage();

                // * Check the groupteam via the API to ensure its role wasn't updated
                cy.apiGetGroupTeam(groupID, team.id).then(({body}) => {
                    expect(body.scheme_admin).to.eq(false);
                });
            });
        });
    });

    describe('updating a channel role', () => {
        it('updates the role for a new channel', () => {
            // # Add a new channel
            addGroupSyncable('channel', (channelName) => {
                // # Update the role
                changeRole(channelName);

                // # Save the settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${channelName}_current_role]`).findByText('Channel Admin');
            });
        });

        it('updates the role for an existing channel', () => {
            cy.apiGetChannelByName('ad-1', 'aut-8').then((response) => {
                // # Link a channel
                const channel = response.body;
                cy.apiLinkGroupChannel(groupID, channel.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel was added to the view
                teamOrChannelIsPresent(channel.display_name);

                // # Change the role
                changeRole(channel.display_name);

                // # Save settings
                savePage();

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${channel.display_name}_current_role]`).findByText('Channel Admin');
            });
        });

        it('does not update the role if not saved', () => {
            cy.apiGetChannelByName('ad-1', 'aut-8').then((response) => {
                // # Link a channel
                const channel = response.body;
                cy.apiLinkGroupChannel(groupID, channel.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel was added to the view
                teamOrChannelIsPresent(channel.display_name);

                // # Change the role
                changeRole(channel.display_name);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Ensure the new role is visible
                cy.get(`div[data-testid=${channel.display_name}_current_role]`).findByText('Member');
            });
        });

        it('does not update the role of a removed channel', () => {
            cy.apiGetChannelByName('ad-1', 'aut-8').then((response) => {
                // # Link a channel
                const channel = response.body;
                cy.apiLinkGroupChannel(groupID, channel.id);

                // # Reload the page
                cy.visit(`/admin_console/user_management/groups/${groupID}`);

                // * Check that the channel was added to the view
                teamOrChannelIsPresent(channel.display_name);

                // # Change the role
                changeRole(channel.display_name);

                cy.get(`button[data-testid='${channel.display_name}_groupsyncable_remove']`).click();
                cy.get('#confirmModalButton').should('be.visible');
                cy.get('#confirmModalButton').click();

                // # Save settings
                savePage();

                // * Check the groupteam via the API to ensure its role wasn't updated
                cy.apiGetGroupChannel(groupID, channel.id).then(({body}) => {
                    expect(body.scheme_admin).to.eq(false);
                });
            });
        });
    });
});