// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';

function demoteGuestUser(guestUser) {
    // # Demote user as guest user before each test
    cy.apiAdminLogin();
    cy.apiGetUserByEmail(guestUser.email).then(({user}) => {
        if (user.roles !== 'system_guest') {
            cy.apiDemoteUserToGuest(guestUser.id);
        }
    });
}

describe('Guest Account - Guest User Experience', () => {
    let guestUser;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
            },
        });

        cy.apiInitSetup({userPrefix: 'guest'}).then(({user, team, channel}) => {
            guestUser = user;

            // # Create new team and visit its URL
            cy.apiDemoteUserToGuest(user.id).then(() => {
                cy.apiAddUserToTeam(team.id, guestUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, guestUser.id).then(() => {
                        cy.apiLogin(guestUser);
                        cy.visit(`/${team.name}/channels/${channel.name}`);
                    });
                });
            });
        });
    });

    it('MM-18043 Verify Guest User Restrictions', () => {
        // * Verify Reduced Options in Main Menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        const missingMainOptions = ['#invitePeople', '#teamSettings', '#manageMembers', '#createTeam', '#joinTeam', '#integrations', '#systemConsole'];
        const includeMainOptions = ['#accountSettings', '#viewMembers', '#leaveTeam'];
        missingMainOptions.forEach((missingOption) => {
            cy.get(missingOption).should('not.exist');
        });
        includeMainOptions.forEach((includeOption) => {
            cy.get(includeOption).should('be.visible');
        });

        // * Verify Reduced Options in LHS
        const missingLHSOptions = ['#createPublicChannel', "li[data-testid='morePublicButton']", '#createPrivateChannel'];
        missingLHSOptions.forEach((missingOption) => {
            cy.get(missingOption).should('not.exist');
        });

        // * Verify Guest Badge in Channel Header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });

        // * Verify list of Users and Guest Badge in Channel Members List
        cy.get('#member_popover').click();
        cy.get('#member-list-popover').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('popoverListMembersItem').should('have.length', 2).each(($elChild) => {
                cy.wrap($elChild).invoke('attr', 'aria-label').then((username) => {
                    if (username === guestUser.username) {
                        cy.wrap($elChild).find('.Badge').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });
        });

        // # Close the Channel Members Popover
        cy.get('#member_popover').click();

        // * Verify list of Users in Direct Messages Dialog
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.FIVE_SEC);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify only 2 users - Guest and sysadmin are listed
            cy.wrap($el).children().should('have.length', 2);
        });
        cy.get('.modal-header .close').click();

        // * Verify Guest Badge when guest user posts a message
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Badge').should('be.visible');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);
            });
        });

        // * Verify Guest Badge in Guest User's Profile Popover
        cy.get('#user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.user-popover__role').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close the profile popover
        cy.get('#channel-header').click();

        // * Verify Guest User can see only 1 additional channel in LHS plus town-square and off-topic
        cy.get('#publicChannelList').find('a').should('have.length', 3);

        // * Verify list of Users a Guest User can see in Team Members dialog
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#viewMembers').click().wait(TIMEOUTS.FIVE_SEC);
        cy.get('#searchableUserListTotal').should('be.visible').and('have.text', '1 - 2 members of 2 total');
    });

    it('MM-18049 Verify Guest User Restrictions is removed when promoted', () => {
        // # Promote a Guest user to a member and reload
        cy.apiAdminLogin();
        cy.apiPromoteGuestToUser(guestUser.id);

        // # Login as guest user
        cy.apiLogin(guestUser);
        cy.reload();

        // * Verify Options in Main Menu are changed
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        const includeMainOptions = ['#accountSettings', '#viewMembers', '#leaveTeam', '#invitePeople', '#createTeam'];
        includeMainOptions.forEach((includeOption) => {
            cy.get(includeOption).should('be.visible');
        });

        // # Close the main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify Options in LHS are changed
        const missingLHSOptions = ['#createPublicChannel', "li[data-testid='morePublicButton']", '#createPrivateChannel'];
        missingLHSOptions.forEach((missingOption) => {
            cy.get(missingOption).should('be.visible');
        });

        // * Verify Guest Badge in Channel Header is removed
        cy.get('#sidebarItem_town-square').click();
        cy.get('#channelIntro').should('be.visible');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('not.exist');
        });

        // * Verify Guest Badge is removed in Channel Members List
        cy.get('#member_popover').click();
        cy.get('#member-list-popover').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('popoverListMembersItem').should('have.length', 2).each(($elChild) => {
                cy.wrap($elChild).invoke('attr', 'aria-label').then((username) => {
                    if (username === guestUser.username) {
                        cy.wrap($elChild).find('.Badge').should('not.exist');
                    }
                });
            });
        });

        // # Close the Channel Members Popover
        cy.get('#member_popover').click();

        // * Verify Guest Badge is removed when user posts a message
        cy.get('#sidebarItem_town-square').click({force: true});
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Badge').should('not.exist');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);
            });
        });

        // * Verify Guest Badge is not displayed in User's Profile Popover
        cy.get('#user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.user-popover__role').should('not.exist');
        });

        // # Close the profile popover
        cy.get('#channel-header').click();
    });

    it('MM-T1417 Add Guest User to New Team from System Console', () => {
        // # Demote Guest user if applicable
        demoteGuestUser(guestUser);

        // # Ceate a new team
        cy.apiCreateTeam('test-team2', 'Test Team2').then(({team: teamTwo}) => {
            // # Add the guest user to this team
            cy.apiAddUserToTeam(teamTwo.id, guestUser.id).then(() => {
                // # Login as guest user
                cy.apiLogin(guestUser);
                cy.reload();

                // # Click team button
                cy.get(`#${teamTwo.name}TeamButton`, {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();

                // * Verify if Channel Not found is displayed
                cy.findByText('Channel Not Found').should('be.visible');
                cy.findByText('Your guest account has no channels assigned. Please contact an administrator.').should('be.visible');
                cy.findByText('Back').should('be.visible').click();

                // * Verify if user is redirected to a valid channel
                cy.findByTestId('post_textbox').should('be.visible');
            });
        });
    });

    it('MM-T1412 Revoke Guest User Sessions when Guest feature is disabled', () => {
        // # Demote Guest user if applicable
        demoteGuestUser(guestUser);

        // # Disable Guest Access
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: false,
            },
        });

        // # Wait for page to load and then logout
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TWO_SEC);
        cy.apiLogout();
        cy.visit('/');

        // # Login with guest user credentials and check the error message
        cy.get('#loginId').type(guestUser.username);
        cy.get('#loginPassword').type('passwd');
        cy.findByText('Sign in').click();

        // * Verify if guest account is deactivated
        cy.findByText('Login failed because your account has been deactivated. Please contact an administrator.').should('be.visible');
    });
});
