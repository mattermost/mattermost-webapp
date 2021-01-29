// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console @group_mentions

import ldapUsers from '../../../fixtures/ldap_users.json';
import * as TIMEOUTS from '../../../fixtures/timeouts';

// assumes the CYPRESS_* variables are set
// assumes that E20 license is uploaded
// for setup with AWS: Follow the instructions mentioned in the mattermost/platform-private/config/ldap-test-setup.txt file

describe('Group Mentions', () => {
    let groupID1;
    let groupID2;
    let boardUser;
    let regularUser;
    let testTeam;

    before(() => {
        // * Check if server has license for LDAP Groups
        cy.apiRequireLicenseForFeature('LDAPGroups');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        cy.apiInitSetup().then(({team, user}) => {
            regularUser = user;
            testTeam = team;
        });

        // # Test LDAP configuration and server connection
        // # Synchronize user attributes
        cy.apiLDAPTest();
        cy.apiLDAPSync();

        // # Link the LDAP Group - board
        cy.visit('/admin_console/user_management/groups');
        cy.get('#board_group', {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
            if (!el.text().includes('Edit')) {
                // # Link the Group if its not linked before
                if (el.find('.icon.fa-unlink').length > 0) {
                    el.find('.icon.fa-unlink').click();
                }
            }
        });

        // # Link the LDAP Group - developers
        cy.visit('/admin_console/user_management/groups');
        cy.get('#developers_group', {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
            if (!el.text().includes('Edit')) {
                // # Link the Group if its not linked before
                if (el.find('.icon.fa-unlink').length > 0) {
                    el.find('.icon.fa-unlink').click();
                }
            }
        });

        // # Get board group id
        cy.apiGetGroups().then((res) => {
            res.body.forEach((group) => {
                if (group.display_name === 'board') {
                    // # Set groupID1 to navigate to group page directly
                    groupID1 = group.id;

                    // # Set allow reference false to ensure correct data for test cases
                    cy.apiPatchGroup(group.id, {allow_reference: false});
                }

                if (group.display_name === 'developers') {
                    // # Set groupID1 to navigate to group page directly
                    groupID2 = group.id;

                    // # Set allow reference false to ensure correct data for test cases
                    cy.apiPatchGroup(group.id, {allow_reference: false});
                }
            });
        });

        // # Login once as board user to ensure the user is created in the system
        boardUser = ldapUsers['board-1'];
        cy.apiLogin(boardUser);

        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Add board user to test team to ensure that it exists in the team and set its preferences to skip tutorial step
        cy.apiGetUserByEmail(boardUser.email).then(({user}) => {
            cy.apiGetChannelByName(testTeam.name, 'town-square').then(({channel}) => {
                cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, user.id);
                });
            });

            cy.apiSaveTutorialStep(user.id, '999');
        });
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Enable Group Mention for the group - board
        cy.visit('/admin_console/user_management/groups');
        cy.get('#board_group', {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
            if (!el.text().includes('Edit')) {
                // # Link the Group if its not linked before
                if (el.find('.icon.fa-unlink').length > 0) {
                    el.find('.icon.fa-unlink').click();
                }
            }
        });
    });

    it('MM-T2447 - Group Mentions when group was unlinked', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName, groupID1);

        // # Unlink the group
        cy.visit('/admin_console/user_management/groups');
        cy.get('#board_group', {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
            el.find('.icon.fa-link').click();
        });

        // # Login as a regular user
        cy.apiLogin(regularUser);

        // # Create a new channel as a regular user
        cy.apiCreateChannel(testTeam.id, 'group-mention', 'Group Mentions').then(({channel}) => {
            // # Visit the channel
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // # Type the Group Name to check if Autocomplete dropdown is not displayed
            cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

            // * Verify if autocomplete dropdown is not displayed
            cy.get('#suggestionList').should('not.be.visible');

            // # Submit a post containing the group mention
            cy.postMessage(`@${groupName}`);

            // * Verify if a system message is not displayed
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

                // * Verify that the group mention is not highlighted
                cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');
            });
        });
    });

    it('MM-T2460 - Group Mentions when used in Direct Message', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName, groupID1);

        // # Login as a regular user
        cy.apiLogin(regularUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Trigger DM with a user
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // # Type the Group Name to check if Autocomplete dropdown is displayed
        cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

        // * Verify if autocomplete dropdown is displayed
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'Group Mentions');
            cy.wrap(el).eq(1).should('contain', groupName);
        });

        // # Submit a post containing the group mention
        cy.postMessage(`@${groupName}`);

        // * Verify if a system message is not displayed
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

            // * Verify that the group mention is not highlighted
            cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

            // * Verify that the group mention has blue colored text
            cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('be.visible');
        });
    });

    it('MM-T2461 - Group Mentions when used in Group Message', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName, groupID1);

        // # Login as a regular user
        cy.apiLogin(regularUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Trigger DM with couple of users
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('.more-modal__row.clickable').eq(1).click();
        cy.get('#saveItems').click();

        // # Type the Group Name to check if Autocomplete dropdown is displayed
        cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

        // * Verify if autocomplete dropdown is displayed
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'Group Mentions');
            cy.wrap(el).eq(1).should('contain', groupName);
        });

        // # Submit a post containing the group mention
        cy.postMessage(`@${groupName}`);

        // * Verify if a system message is not displayed
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

            // * Verify that the group mention is not highlighted
            cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

            // * Verify that the group mention has blue colored text
            cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('be.visible');
        });
    });

    it('MM-T2443 - Group Mentions when Channel is Group Synced', () => {
        const groupName = `board_test_case_${Date.now()}`;
        const groupName2 = `developers_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName, groupID1);
        enableGroupMention(groupName2, groupID2);

        // # Create a new channel as a regular user
        cy.apiCreateChannel(testTeam.id, 'group-mention-2', 'Group Mentions 2').then(({channel}) => {
            // # Link the group and the channel.
            cy.apiLinkGroupChannel(groupID1, channel.id);

            cy.apiLogin({username: 'board.one', password: 'Password1'}).then(({user}) => {
                cy.apiAddUserToChannel(channel.id, user.id);

                // # Make the channel private and group-synced.
                cy.apiPatchChannel(channel.id, {group_constrained: true, type: 'P'});

                // # Login to create the dev user
                cy.apiLogin({username: 'dev.one', password: 'Password1'}).then(({user: user2}) => {
                    cy.apiAdminLogin();
                    cy.apiAddUserToTeam(testTeam.id, user2.id);

                    cy.apiLogin({username: 'board.one', password: 'Password1'});

                    // # Visit the channel
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

                    cy.postMessage(`@${groupName2}`);

                    // * Verify if a system message is not displayed
                    cy.getLastPostId().then((postId) => {
                        cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName2}`);
                    });
                });
            });
        });
    });

    function enableGroupMention(groupName, groupID) {
        // # Visit Group Configurations page
        cy.visit(`/admin_console/user_management/groups/${groupID}`);

        // # Scroll users list into view and then make sure it has loaded before scrolling back to the top
        cy.get('#group_users', {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView();

        cy.get('#group_profile').scrollIntoView().wait(TIMEOUTS.TWO_SEC);

        // # Click the allow reference button
        cy.findByTestId('allowReferenceSwitch').then((el) => {
            const button = el.find('button');
            const classAttribute = button[0].getAttribute('class');
            if (!classAttribute.includes('active')) {
                button[0].click();
            }
        });

        // # Give the group a custom name different from its DisplayName attribute
        cy.get('#groupMention').find('input').clear().type(groupName);

        // # Click save button
        saveConfig();
    }

    function saveConfig() {
        cy.get('#saveSetting').then((btn) => {
            if (btn.is(':enabled')) {
                btn.click();

                cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
                    return el[0].innerText === 'Save';
                }));
            }
        });
    }
});
