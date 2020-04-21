// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../../utils';
import users from '../../../fixtures/users.json';
import * as TIMEOUTS from '../../../fixtures/timeouts';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const checkboxesTitleToIdMap = {
    CREATE_POSTS_GUESTS: 'create_post-guests',
    CREATE_POSTS_MEMBERS: 'create_post-members',
    POST_REACTIONS_GUESTS: 'create_reactions-guests',
    POST_REACTIONS_MEMBERS: 'create_reactions-members',
    MANAGE_MEMBERS_GUESTS: 'manage_members-guests',
    MANAGE_MEMBERS_MEMBERS: 'manage_members-members',
    CHANNEL_MENTIONS_MEMBERS: 'use_channel_mentions-members',
    CHANNEL_MENTIONS_GUESTS: 'use_channel_mentions-guests',
};

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

const checkBoxes = [
    checkboxesTitleToIdMap.CREATE_POSTS_GUESTS,
    checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS,
    checkboxesTitleToIdMap.POST_REACTIONS_GUESTS,
    checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS,
    checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS,
    checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS,
    checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS,
];

const demoteToChannelOrTeamMember = (userId, id, channelsOrTeams = 'channels') => {
    cy.externalRequest({
        user: users.sysadmin,
        method: 'put',
        path: `${channelsOrTeams}/${id}/members/${userId}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: false,
        }
    });
};

const promoteToChannelOrTeamAdmin = (userId, id, channelsOrTeams = 'channels') => {
    cy.externalRequest({
        user: users.sysadmin,
        method: 'put',
        path: `${channelsOrTeams}/${id}/members/${userId}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: true,
        }
    });
};

// # Disable (uncheck) all the permissions in the channel moderation widget
const disableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

// # Enable (check) all the permissions in the channel moderation widget
const enableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (!btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

// # Enable (check) all the permissions in the channel moderation widget through the API
const enableDisableAllChannelModeratedPermissionsViaAPI = (channelId, enable = true) => {
    cy.externalRequest(
        {
            user: users.sysadmin,
            method: 'PUT',
            path: `channels/${channelId}/moderations/patch`,
            data:
                [
                    {
                        name: 'create_post',
                        roles: {
                            members: enable,
                            guests: enable,
                        }
                    },
                    {
                        name: 'create_reactions',
                        roles: {
                            members: enable,
                            guests: enable,
                        }
                    },
                    {
                        name: 'manage_members',
                        roles: {
                            members: enable,
                        }
                    },
                    {
                        name: 'use_channel_mentions',
                        roles: {
                            members: enable,
                            guests: enable,
                        }
                    },
                ],
        }
    );
};

const deleteExistingTeamOverrideSchemes = () => {
    cy.apiLogin('sysadmin');
    cy.apiGetSchemes('team').then((res) => {
        res.body.forEach((scheme) => {
            cy.apiDeleteScheme(scheme.id);
        });
    });
};

// # Disable a specific channel moderated permission in the channel moderation widget
const disableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).then((btn) => {
        if (btn.hasClass('checked')) {
            btn.click();
        }
    });
};

// # Enable a specific channel moderated permission in the channel moderation widget
const enableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).then((btn) => {
        if (!btn.hasClass('checked')) {
            btn.click();
        }
    });
};

// # This goes to the system scheme and clicks the reset permissions to default and then saves the setting
const resetSystemSchemePermissionsToDefault = () => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions/system_scheme');
    cy.findByTestId('resetPermissionsToDefault').click();
    cy.get('#confirmModalButton').click();
    saveConfig();
};

// # Goes to the permissions page and clicks edit or delete for a team override scheme
const deleteOrEditTeamScheme = (schemeDisplayName, editOrDelete) => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId(`${schemeDisplayName}-${editOrDelete}`).click();
    if (editOrDelete === 'delete') {
        cy.get('#confirmModalButton').click();
    }
};

// # Visits a channel as the member specified
const visitChannel = (loginAs, channelName) => {
    cy.apiLogin(loginAs);
    cy.visit(`/ad-1/channels/${channelName}`);
    cy.get('#postListContent', {timeout: TIMEOUTS.HUGE}).should('be.visible');
};

const visitAutemChannel = (loginAs) => {
    visitChannel(loginAs, 'aut-8');
};

// # Goes to the System Scheme page as System Admin
const goToSystemScheme = () => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions/system_scheme');
};

// # Goes to the permissions page and creates a new team override scheme with schemeName
const goToPermissionsAndCreateTeamOverrideScheme = (schemeName) => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId('team-override-schemes-link').click();
    cy.get('#scheme-name').type(schemeName);
    cy.findByTestId('add-teams').click();
    cy.get('#selectItems').click().type('eligendi');
    cy.get('#multiSelectList').should('be.visible').children().first().click({force: true});
    cy.get('#saveItems').should('be.visible').click();
    saveConfig(false);
    cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting
};

// # Visits the channel configuration for a channel with channelName
const visitChannelConfigPage = (channelName) => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/channels');
    cy.findByTestId('search-input').type(`${channelName}{enter}`);
    cy.findByTestId(`${channelName}edit`).click();
    cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting
};

// # Visit the channel configuration page of Autem channel
const visitAutemChannelConfigPage = () => {
    visitChannelConfigPage('autem');
};

// Clicks the save button in the system console page.
// waitUntilConfigSaved: If we need to wait for the save button to go from saving -> save.
// Usually we need to wait unless we are doing this in team override scheme
const saveConfig = (waitUntilConfigSaved = true, clickConfirmationButton = false) => {
    // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
    cy.get('#saveSetting').then((btn) => {
        if (!btn.disabled) {
            btn.click();
        }
    });
    if (clickConfirmationButton) {
        cy.get('#confirmModalButton').click();
    }
    if (waitUntilConfigSaved) {
        waitUntilConfigSave();
    }
};

// # Clicks the View/Manage channel members for a channel (Text changes between View and Manage depending on your role in the channel)
const viewManageChannelMembersModal = (viewOrManage) => {
    // # Click member count to open member list popover
    cy.get('#member_popover').click();

    cy.get('#member-list-popover').should('be.visible').within(() => {
        // # Click "View/Manage Members"
        cy.findByText(`${viewOrManage} Members`).click();
    });
};

// # Checks to see if we got a system message warning after using @all/@here/@channel
const postChannelMentionsAndVerifySystemMessageExist = () => {
    // # Type @all and post it to the channel
    cy.findByTestId('post_textbox').clear().type('@all{enter}');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @all did not trigger any notifications.');
    });

    // # Type @here and post it to the channel
    cy.findByTestId('post_textbox').clear().type('@here{enter}');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @here did not trigger any notifications.');
    });

    cy.findByTestId('post_textbox').clear().type('@channel{enter}');

    // # Type last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @channel did not trigger any notifications.');
    });
};

// # Checks to see if we did not get a system message warning after using @all/@here/@channel
const postChannelMentionsAndVerifySystemMessageNotExist = () => {
    cy.findByTestId('post_textbox').clear().type('@all{enter}{enter}{enter}');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', 'Channel notifications are disabled in aut-8. The @all did not trigger any notifications.');
    });

    cy.findByTestId('post_textbox').clear().type('@here{enter}{enter}{enter}');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', 'Channel notifications are disabled in aut-8. The @here did not trigger any notifications.');
    });

    cy.findByTestId('post_textbox').clear().type('@channel{enter}{enter}{enter}');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', 'Channel notifications are disabled in aut-8. The @channel did not trigger any notifications.');
    });
};

describe('Channel Moderation Test', () => {
    let autemChannelId;
    before(() => {
        // * Check if server has license
        cy.requireLicense();

        visitAutemChannel('sysadmin');
        cy.getCurrentChannelId().then((channelId) => {
            autemChannelId = channelId;
        });

        visitAutemChannel('user-1');

        // # Demote user to Channel Member
        cy.apiGetMe().then((res) => {
            demoteToChannelOrTeamMember(res.body.id, autemChannelId);
        });

        // # Demote user to Team Member
        cy.apiGetMe().then((res) => {
            cy.getCurrentTeamId().then((teamId) => {
                demoteToChannelOrTeamMember(res.body.id, teamId, 'teams');
            });
        });

        // # Make the guest user as Active
        cy.apiGetUserByEmail(users.guest.email).then((res) => {
            const user = res.body;
            cy.apiActivateUser(user.id, true);
        });
    });

    beforeEach(() => {
        // Reset permissions in system scheme to defaults.
        resetSystemSchemePermissionsToDefault();

        // # Delete all Team Override Schemes
        deleteExistingTeamOverrideSchemes();

        // // # Reset Autem Channel Moderation settings to default (everything on)
        enableDisableAllChannelModeratedPermissionsViaAPI(autemChannelId);
    });

    describe('MM-23102 - Create Posts', () => {
        it('Create Post option for Guests', () => {
            const loginAs = 'guest';

            // # Go to channel configuration page of
            visitAutemChannelConfigPage();

            // # Uncheck the Create Posts option for Guests and Save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Guest user should not have the permission to create a post on a channel when the option is removed
            // * Guest user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('be.disabled');

            // # As a system admin, check the option to allow Create Posts for Guests and save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Guest user should have the permission to create a post on a channel when the option is allowed
            // * Guest user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox').clear();
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'Write to autem');
            cy.findByTestId('post_textbox').should('not.be.disabled');
        });

        it('Create Post option for Members', () => {
            const loginAs = 'user-1';

            // # Go to system admin page and to channel configuration page of channel "autem"
            visitAutemChannelConfigPage();

            // # Uncheck the Create Posts option for Members and Save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);
            saveConfig();

            // # Login as a Guest user and visit Autem channel
            visitAutemChannel(loginAs);

            // # Check Member should not have the permission to create a post on a channel when the option is removed.
            // * User should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('be.disabled');

            // # As a system admin, check the option to allow Create Posts for Members and save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Member should have the permission to create a post on a channel when the option is allowed
            // * Member user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox').clear();
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'Write to autem');
            cy.findByTestId('post_textbox').should('not.be.disabled');
        });
    });

    describe('MM-23102 - Post Reactions', () => {
        before(() => {
            // Post a few messages in the channel
            visitAutemChannel('sysadmin');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');
        });

        it('Post Reactions option for Guests', () => {
            const loginAs = 'guest';

            visitAutemChannelConfigPage();

            // # Uncheck the post reactions option for Guests and save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Guest user should not have the permission to react to any post on a channel when the option is removed.
            // * Guest user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            // # Visit Autem channel configuration page and enable post reactions for guest and save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);
            saveConfig();

            visitAutemChannel(loginAs);

            // # Check Guest user should have the permission to react to any post on a channel when the option is allowed.
            // * Guest user should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });
        });

        it('Post Reactions option for Members', () => {
            const loginAs = 'user-1';

            visitAutemChannelConfigPage();

            // # Uncheck the Create reactions option for Members and save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Member user should not have the permission to react to any post on a channel when the option is removed.
            // * Member user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            // # Visit Autem Channel configuration page and enable post reactions for memebers and save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check Member user should have the permission to react to any post on a channel when the option is allowed.
            // * Member user should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });
        });

        it('Post Reactions option removed for Guests and Members in System Scheme', () => {
            // # Login as sysadmin and visit the Permissions page in the system console.
            // # Edit the System Scheme and remove the Post Reaction option for Guests & Save.
            goToSystemScheme();
            cy.get('#guests-reactions').click();
            saveConfig();

            // # Visit the Channels page and click on a channel.
            visitAutemChannelConfigPage();

            // * Assert that post reaction is disabled for guest and not disabled for members and a message is displayed
            cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledGuest').
                should('exist').
                and('have.text', 'Post reactions for guests are disabled in System Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('not.be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS).should('be.disabled');

            // # Go to system admin page and then go to the system scheme and remove post reaction option for all members and save
            goToSystemScheme();
            cy.get('#all_users-posts-reactions').click();
            saveConfig();

            visitAutemChannelConfigPage();

            // * Post Reaction option should be disabled for a Members. A message Post reactions for guests & members are disabled in the System Scheme should be displayed.
            cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledBoth').
                should('exist').
                and('have.text', 'Post reactions for members and guests are disabled in System Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS).should('be.disabled');

            // # Login as a Guest user and visit the same channel
            visitAutemChannel('guest');

            // # Check Guest User should not have the permission to react to any post on any channel when the option is removed from the System Scheme.
            // * Guest user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            // # Login as a Member user and visit the same channel
            visitAutemChannel('user-1');

            // # Check Member should not have the permission to react to any post on any channel when the option is removed from the System Scheme.
            // * Member user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });
        });

        // GUEST PERMISSIONS DON'T EXIST ON TEAM OVERRIDE SCHEMES SO GUEST PORTION NOT IMPLEMENTED!
        // ONLY THE MEMBERS PORTION OF THIS TEST IS IMPLEMENTED
        it('Post Reactions option removed for Guests & Members in Team Override Scheme', () => {
            const teamOverrideSchemeName = 'post_reactions';

            // # Create a new team override scheme
            goToPermissionsAndCreateTeamOverrideScheme(teamOverrideSchemeName);

            visitAutemChannelConfigPage();

            // * Assert that post reaction is disabled for members is not disabled
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('not.be.disabled');

            // # Go to system admin page and then go to the system scheme and remove post reaction option for all members and save
            deleteOrEditTeamScheme('post_reactions', 'edit');
            cy.get('#all_users-posts-reactions').click();
            saveConfig(false);

            // # Wait until the groups have been saved (since it redirects you)
            cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

            visitAutemChannelConfigPage();

            // * Assert that post reaction is disabled for members
            cy.findByTestId('create_reactions-members').should('be.disabled');

            // # Login as a Member user and visit the same channel
            visitAutemChannel('user-1');

            // # Check Member should not have the permission to react to any post on any channel in that team when the option is removed from the Team Override Scheme
            // * User should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });
        });
    });

    describe('MM-23102 - Manage Members', () => {
        it('No option to Manage Members for Guests', () => {
            visitAutemChannelConfigPage();

            // * Assert that Manage Members for Guests does not exist (checkbox is not there)
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');

            visitAutemChannel('guest');

            // # View members modal
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Manage Members option for Members', () => {
            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');

            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');
            viewManageChannelMembersModal('Manage');

            // * Add Members button does exist
            cy.get('#showInviteModal').should('exist');
        });

        it('Manage Members option removed for Members in System Scheme', () => {
            // Edit the System Scheme and remove the Manage Members option for Members & Save.
            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();

            // * Assert that Manage Members option should be disabled for a Members.
            // * A message Manage members for members are disabled in the System Scheme should be displayed.
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('exist').
                and('have.text', 'Manage members for members are disabled in System Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');

            visitAutemChannel('user-1');
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Manage Members option removed for Members in Team Override Scheme', () => {
            // # Create a new team override scheme and remove manage members option for members
            goToPermissionsAndCreateTeamOverrideScheme('manage_members');
            deleteOrEditTeamScheme('manage_members', 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);
            cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

            // * Assert that Manage Members is disabled for members and a message is displayed
            visitAutemChannelConfigPage();
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('exist').
                and('have.text', 'Manage members for members are disabled in manage_members Team Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');

            visitAutemChannel('user-1');
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist in manage channel members modal
            cy.get('#showInviteModal').should('not.exist');
        });
    });

    describe('MM-23102 - Channel Mentions', () => {
        it('Channel Mentions option for Guests', () => {
            // # Uncheck the Channel Mentions option for Guests and save
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS);
            saveConfig();

            visitAutemChannel('guest');

            // # Check Guest user has the permission to user special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageExist();

            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # check the channel mentions option for guests and save
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS);
            saveConfig();

            visitAutemChannel('guest');

            // # Check Guest user has the permission to user special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageNotExist();
        });

        it('Channel Mentions option for Members', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the channel mentions option for guests and save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');

            // # Check Member user does not has the permission to use special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageExist();

            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # check the channel mentions option for guests and save
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');

            // # Check Member user has the permission to user special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageNotExist();
        });

        it('Channel Mentions option removed when Create Post is disabled', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the create posts option for guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);

            // * Option to allow Channel Mentions for Guests should also be disabled when Create Post option is disabled.
            // * A message Guests can not use channel mentions without the ability to create posts should be displayed.
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledGuestsDueToCreatePosts').
                should('have.text', 'Guests can not use channel mentions without the ability to create posts.');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS).should('be.disabled');

            // # check the create posts option for guests and uncheck for memebers
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);

            // * Option to allow Channel Mentions for Members should also be disabled when Create Post option is disabled.
            // * A message Members can not use channel mentions without the ability to create posts should be displayed.
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledMemberDueToCreatePosts').
                should('have.text', 'Members can not use channel mentions without the ability to create posts.');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS).should('be.disabled');

            // # Uncheck the create posts option for guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);

            // * Ensure that channel mentions for members and guests is disabled
            // * Ensure message Guests & Members can not use channel mentions without the ability to create posts
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledBothDueToCreatePosts').
                should('have.text', 'Guests and members can not use channel mentions without the ability to create posts.');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS).should('be.disabled');
        });

        it('Message when user without channel mention permission uses special channel mentions', () => {
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');

            cy.findByTestId('post_textbox').clear().type('@');

            // * Ensure that @here, @all, and @channel do not show up in the autocomplete list
            cy.findAllByTestId('mentionSuggestion_here').should('not.exist');
            cy.findAllByTestId('mentionSuggestion_all').should('not.exist');
            cy.findAllByTestId('mentionSuggestion_channel').should('not.exist');

            // * When you type @all, @enter, and @channel make sure that a system message shows up notifying you nothing happened.
            postChannelMentionsAndVerifySystemMessageExist();
        });

        it('Confirm sending notifications while using special channel mentions', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            // # Set @channel and @all confirmation dialog to true
            cy.visit('admin_console/environment/notifications');
            cy.findByTestId('TeamSettings.EnableConfirmNotificationsToChanneltrue').check();
            saveConfig();

            // # Visit autem channel
            visitAutemChannel('user-1');

            // * Type at all and enter that no confirmation dialogue shows up
            cy.findByTestId('post_textbox').clear().type('@all{enter}');
            cy.get('#confirmModalLabel').should('not.exist');

            // * Type at channel and enter that no confirmation dialogue shows up
            cy.findByTestId('post_textbox').clear().type('@channel{enter}');
            cy.get('#confirmModalLabel').should('not.exist');

            // * Type at here and enter that no confirmation dialogue shows up
            cy.findByTestId('post_textbox').clear().type('@here{enter}');
            cy.get('#confirmModalLabel').should('not.exist');
        });
    });

    describe('MM-23102 - Higher Scoped Scheme', () => {
        const createNewChannel = (channelName, createAs) => {
            cy.apiLogin(createAs);
            cy.visit('/ad-1/channels');
            cy.get('#createPublicChannel').click();
            cy.get('#newChannelName').clear().type(channelName);
            cy.get('#submitNewChannel').click();
        };

        it('Effect of changing System Schemes on a Channel for which Channel Moderation Settings was modified', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            // # check the channel mentions option for guests and save
            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            // * Ensure manange members for members is disabled
            visitAutemChannelConfigPage();
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitAutemChannel('user-1');

            // # View members modal
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Effect of changing System Schemes on a Channel for which Channel Moderation Settings was never modified', () => {
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            const randomChannelName = 'NeverModifiedChannel' + getRandomInt(1000);
            createNewChannel(randomChannelName, 'sysadmin');

            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            // # Visit Channel page and Search for the channel.
            // * ensure manange members for members is disabled
            visitChannelConfigPage(randomChannelName);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitChannel('user-1', randomChannelName.toLowerCase());

            // # View members modal
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Effect of changing Team Override Schemes on a Channel for which Channel Moderation Settings was never modified', () => {
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            const randomChannelName = 'NeverModifiedChannel' + getRandomInt(1000);
            createNewChannel(randomChannelName, 'sysadmin');
            goToPermissionsAndCreateTeamOverrideScheme(`${randomChannelName}`);
            deleteOrEditTeamScheme(`${randomChannelName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            // * Assert message for manage member for members appears and that it's disabled
            visitChannelConfigPage(randomChannelName);
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('have.text', `Manage members for members are disabled in ${randomChannelName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitChannel('user-1', randomChannelName.toLowerCase());

            // # View members modal
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Effect of changing Team Override Schemes on a Channel for which Channel Moderation Settings was modified', () => {
            const teamOverrideSchemeName = 'autem' + getRandomInt(1000);

            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            // * Assert message shows and manage members for members is disabled
            visitAutemChannelConfigPage();
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitAutemChannel();

            // # View members modal
            viewManageChannelMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Manage Members removed for Public Channels', () => {
            const teamOverrideSchemeName = 'autem' + getRandomInt(1000);

            // # Create a new team override scheme and remove manage public channel members
            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();

            // * Ensure that manage private channel members is checked
            cy.get('#all_users-private_channel-manage_private_channel_members').children().should('have.class', 'checked');
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            // * Ensure message is disabled and manage members for members is disabled
            visitAutemChannelConfigPage();
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            // # Turn channel into a private channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            // * Ensure it is private and no error message is shown and that manage members for members is not disabled
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('not.have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('not.be.disabled');

            // # Turn channel back to public channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            // * ensure it got reverted back to a Public channel
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
        });

        it('Manage Members removed for Private Channels / Permissions inherited when channel converted from Public to Private', () => {
            const teamOverrideSchemeName = 'autem' + getRandomInt(1000);

            // # Create a new team override scheme and remove manage private channel members from it
            // * Ensure that manage public channel members is checked
            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-private_channel-manage_private_channel_members').click();
            cy.get('#all_users-public_channel-manage_public_channel_members').children().should('have.class', 'checked');
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // * Ensure that error message is not displayed and manage members for members is not disabled
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('not.have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('not.be.disabled');

            // # Turn it into a private channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            // * Ensure it is a private channel and that a message is disabled and also manage members for members is disabled
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
                should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            // # Turn channel back to public channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            // * Ensure it got reset back to a public channel
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
        });

        it('Check if user is allowed to Edit or Delete their own posts on a Read-Only channel', () => {
            visitAutemChannel('user-1');
            cy.findByTestId('post_textbox').clear().type('testMessage123123{enter}');
            cy.findByTestId('post_textbox_placeholder').should('not.have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('not.be.disabled');

            visitChannelConfigPage('autem');
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');

            // * user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('be.disabled');

            cy.getLastPostId().then((postId) => {
                cy.clickPostDotMenu(postId);

                // * As per test case, ensure edit and delete button show up
                cy.get(`#edit_post_${postId}`).should('exist');
                cy.get(`#delete_post_${postId}`).should('exist');
            });
        });

        it('Channel Moderation Settings should not be applied for Channel Admins', () => {
            enableDisableAllChannelModeratedPermissionsViaAPI(autemChannelId, false);
            visitAutemChannel('user-1');
            cy.apiGetMe().then((res) => {
                promoteToChannelOrTeamAdmin(res.body.id, autemChannelId);
            });

            // * Assert user can post message and user channel mentions
            postChannelMentionsAndVerifySystemMessageNotExist();

            // # Check Channel Admin have the permission to react to any post on a channel when all channel moderation permissions are off.
            // * Channel Admin should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });

            // # View members modal
            viewManageChannelMembersModal('Manage');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('exist');

            cy.apiGetMe().then((res) => {
                demoteToChannelOrTeamMember(res.body.id, autemChannelId);
            });
        });

        it('Channel Moderation Settings should not be applied for Team Admins', () => {
            enableDisableAllChannelModeratedPermissionsViaAPI(autemChannelId, false);
            visitAutemChannel('user-1');
            cy.apiGetMe().then((res) => {
                cy.getCurrentTeamId().then((teamId) => {
                    promoteToChannelOrTeamAdmin(res.body.id, teamId, 'teams');
                });
            });

            // * Assert user can post message and user channel mentions
            postChannelMentionsAndVerifySystemMessageNotExist();

            // # Check Channel Admin have the permission to react to any post on a channel when all channel moderation permissions are off.
            // * Channel Admin should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });

            // # View members modal
            viewManageChannelMembersModal('Manage');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('exist');

            cy.apiGetMe().then((res) => {
                cy.getCurrentTeamId().then((teamId) => {
                    demoteToChannelOrTeamMember(res.body.id, teamId, 'teams');
                });
            });
        });
    });

    it('MM-22276 - Enable and Disable all channel moderated permissions', () => {
        const channelName = 'autem';

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/channels');

        // # Search for the channel.
        cy.findByTestId('search-input').type(`${channelName}{enter}`);
        cy.findByTestId(`${channelName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Check all the boxes currently unchecked (align with the system scheme permissions)
        enableAllChannelModeratedPermissions();

        // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
        cy.get('#saveSetting').then((btn) => {
            if (!btn.disabled) {
                btn.click();
            }
        });
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // * Ensure all checkboxes are checked
        checkBoxes.forEach((buttonId) => {
            cy.findByTestId(buttonId).should('have.class', 'checked');
        });

        // # Uncheck all the boxes currently checked
        disableAllChannelModeratedPermissions();

        // # Save the page and wait till saving is done
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // * Ensure all checkboxes have the correct unchecked state
        checkBoxes.forEach((buttonId) => {
            // * Ensure all checkboxes are unchecked
            cy.findByTestId(buttonId).should('not.have.class', 'checked');

            // * Ensure Channel Mentions are disabled due to Create Posts
            if (buttonId.includes('use_channel_mentions')) {
                cy.findByTestId(buttonId).should('be.disabled');
                return;
            }

            // * Ensure all other check boxes are still enabled
            cy.findByTestId(buttonId).should('not.be.disabled');
        });
    });
});
