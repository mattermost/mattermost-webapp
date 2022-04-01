// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel @rhs @channel_members

function openChannelMembersRhs(testTeam, testChannel) {
    // # Go to test channel
    cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

    // # Click on the channel info button
    cy.get('#channel-info-btn').click();

    // # Click on the Members menu
    cy.uiGetRHS().findByText('Members').should('be.visible').click();
}

describe('Channel members RHS', () => {
    let testTeam;
    let testChannel;
    let admin;
    let user;

    before(() => {
        cy.apiInitSetup({promoteNewUserAsAdmin: true}).then(({team, user: newAdmin}) => {
            testTeam = team;
            admin = newAdmin;

            // User we'll use for our permissions tests
            cy.apiCreateUser().then(({user: newUser}) => {
                user = newUser;
                cy.apiAddUserToTeam(team.id, newUser.id).then(() => {
                    cy.apiCreateChannel(testTeam.id, 'channel', 'Public Channel', 'O').then(({channel}) => {
                        testChannel = channel;
                        cy.apiAddUserToChannel(channel.id, newAdmin.id);
                        cy.apiAddUserToChannel(channel.id, newUser.id);
                    });
                });
            });

            // # Change permission so that regular users can't change channels or add members
            cy.apiGetRolesByNames(['channel_user']).then(({roles}) => {
                const role = roles[0];
                const permissions = role.permissions.filter((permission) => {
                    return !(['manage_public_channel_members', 'manage_private_channel_members', 'manage_public_channel_properties', 'manage_private_channel_properties'].includes(permission));
                });

                if (permissions.length !== role.permissions) {
                    cy.apiPatchRole(role.id, {permissions});
                }
            });

            cy.apiLogin(admin);
        });
    });

    it('should be able to open the RHS', () => {
        // # Open the Channel Members RHS
        openChannelMembersRhs(testTeam, testChannel);

        // * RHS Container should exist
        cy.get('#rhsContainer').then((rhsContainer) => {
            cy.wrap(rhsContainer).findByText('Members').should('be.visible');
            cy.wrap(rhsContainer).findByText(testChannel.display_name).should('be.visible');
        });
    });

    it('should display the number of members', () => {
        // # Open the Channel Members RHS
        openChannelMembersRhs(testTeam, testChannel);

        // * Verify that we can toggle the favorite status
        cy.uiGetRHS().findByText('3 members').should('be.visible');
    });

    it('should display search when number of members is 20 or above', () => {
        cy.apiCreateChannel(testTeam.id, 'search-test-channel', 'Search Test Channel', 'O').then(({channel}) => {
            // # Open the Channel Members RHS
            openChannelMembersRhs(testTeam, channel);

            // * Ensure the search bar is not there
            cy.findByPlaceholderText('Search members').should('not.exist');

            const userAddedToChannelPromises = [];
            const users = [];
            for (let i = 0; i < 20; i++) {
                cy.apiCreateUser().then(({user: newUser}) => {
                    users.push(newUser);
                    cy.apiAddUserToTeam(testTeam.id, newUser.id).then(() => {
                        userAddedToChannelPromises.push(cy.apiAddUserToChannel(channel.id, newUser.id));
                    });
                });
            }

            Promise.all(userAddedToChannelPromises).then(() => {
                // * Ensure the search bar is there
                cy.findByPlaceholderText('Search members').should('be.visible');
            });
        });
    });

    describe('as an admin', () => {
        it('should be able to invite new members', () => {
            // # Open the Channel Members RHS
            openChannelMembersRhs(testTeam, testChannel);

            // # Click on the Add button
            cy.uiGetRHS().findByText('Add').should('be.visible').click();

            // * The modal should appear
            cy.get('.channel-invite').should('be.visible');
        });

        it('should be able to manage members', () => {
            // # Open the Channel Members RHS
            openChannelMembersRhs(testTeam, testChannel);

            // # Click on the Manage button
            cy.uiGetRHS().findByText('Manage').should('be.visible').click();

            // * Can see user with their roles, and change it
            cy.uiGetRHS().findByTestId(`memberline-${user.id}`).should('be.visible').within(() => {
                cy.findByText(`@${user.username}`).should('be.visible');
                cy.findByText('Member').should('be.visible').click();
                cy.findByText('Make Channel Admin').should('be.visible').click();
            });

            // the user line is going to be removed and re-added in another category,
            // cypress struggle to realize this so we have to wait a few ms
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(100);

            // * Can see the user with his new admin role, and change it back
            cy.uiGetRHS().findByTestId(`memberline-${user.id}`).should('be.visible').within(() => {
                cy.findByText('Admin').should('be.visible').click();
                cy.findByText('Make Channel Member').should('be.visible').click();
            });
        });
    });
});
