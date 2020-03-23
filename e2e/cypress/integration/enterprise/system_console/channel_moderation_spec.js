// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { getRandomInt } from "../../../utils";

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
    MANAGE_MEMBERS_GUESTS: 'manage_members-guets',
    MANAGE_MEMBERS_MEMBERS: 'manage_members-members',
    CHANNEL_MENTIONS_MEMBERS: 'use_channel_mentions-members',
    CHANNEL_MENTIONS_GUESTS: 'use_channel_mentions-guests',
}


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

const disableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

const enableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (!btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

const disableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).then((btn) => {
        if (btn.hasClass('checked')) {
            btn.click();
        }
    });
};


const enableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).then((btn) => {
        if (!btn.hasClass('checked')) {
            btn.click();
        }
    });
};

const resetSystemSchemePermissionsToDefault = () => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions/system_scheme');
    cy.findByTestId('resetPermissionsToDefault').click();
    cy.get('#confirmModalButton').click();
    cy.get('#saveSetting').click();
    waitUntilConfigSave();
}


const deleteOrEditTeamScheme = (schemeDisplayName, editOrDelete) => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId(`${schemeDisplayName}-${editOrDelete}`).click();
    if (editOrDelete === 'delete') {
        cy.get('#confirmModalButton').click();
    }
}

const visitChannel = (loginAs, channelName) => {
    // # Login as a Member user and visit the same channel
    cy.apiLogin(loginAs);
    cy.visit(`/ad-1/channels/${channelName}`);
}

const visitAutemChannel = (loginAs) => {
    // # Login as a Member user and visit the same channel
    visitChannel(loginAs, 'aut-8')
}

const goToSystemScheme = () => {
    // # Go to system admin page and then go to the system scheme and remove post reaction option for guests and save
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions/system_scheme');
}

const goToPermissionsAndCreateTeamOverrideScheme = (schemeName) => {
    // # Go to system admin page and then create a new team scheme and remove guest permissions
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId('new-team-override-scheme').click();
    cy.get('#scheme-name').type(schemeName);
    cy.findByTestId('add-teams').click();
    cy.get('#selectItems').click().type('eligendi');
    cy.get('#multiSelectList').should('be.visible').children().first().click({force: true});
    cy.get('#saveItems').should('be.visible').click();
    cy.get('#saveSetting').click();
    // # Wait until the groups have been saved (since it redirects you)
    cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting
}

const visitAutemChannelConfigPage = () => {
    visitChannelConfigPage('autem');
}

const visitChannelConfigPage = (channelName) => {
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/channels');
    cy.findByTestId('search-input').type(`${channelName}{enter}`);
    cy.findByTestId(`${channelName}edit`).click();
    // # Wait until the groups retrieved and show up
    cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting
}

const saveConfig = (waitForSaveConfig = true, clickConfirmationButton = false) => {
    // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
    cy.get('#saveSetting').then((btn) => {
        if (!btn.disabled) {
            btn.click();
        }
    });
    if (clickConfirmationButton) {
        cy.get('#confirmModalButton').click();
    }
    if (waitForSaveConfig) {
        waitUntilConfigSave();
    }
}

const viewMembersModal = (viewOrManage) => {
    // # Click member count to open member list popover
    cy.get('#member_popover').click();

    cy.get('#member-list-popover').should('be.visible').within(() => {
        // # Click "View/Manage Members"
        cy.findByText(`${viewOrManage} Members`).click();
    });
}

const postChannelMentionsAndVerifySystemMessageExist = () => {
    cy.findByTestId('post_textbox').clear().type('@all{enter}');
    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @all did not trigger any notifications.');
    });

    cy.findByTestId('post_textbox').clear().type('@here{enter}');
    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @here did not trigger any notifications.');
    });

    cy.findByTestId('post_textbox').clear().type('@channel{enter}');
    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled in aut-8. The @channel did not trigger any notifications.');
    });
}

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
}

describe('Channel Moderation Test', () => {
    beforeEach(() => {
        // * Check if server has license
        cy.requireLicense();

        // Reset permissions in system scheme to defaults.
        resetSystemSchemePermissionsToDefault();

        // # Delete all Team Override Schemes
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions');
        cy.get('#team-override-schemes-list').then((elements) => {
            console.log(elements[0]);
            for (let i = 1; i < elements[0].children.length && elements[0].children[1].className !== 'no-team-schemes'; i++) {
                elements[0].children[i].children[1].children[1].lastChild.click();
                cy.get('#confirmModalButton').click({force: true});
            }
        });

        // # Reset Autem Channel Moderation settings to default (everything on)
        // # Visit Autem channel page and turn on all of it's channel moderation (reset it to default)
        visitAutemChannelConfigPage();
        enableAllChannelModeratedPermissions();
        saveConfig();
    });

    describe('MM-23102 - Create Posts', () => {
        it('Create Post option for Guests', () => {
            const channelName = 'autem';
            const loginAs = 'guest';

            // # Go to system admin page and to channel configuration page of channel "autem"
            visitChannelConfigPage(channelName);

            // # Check all the boxes currently unchecked (align with the system scheme permissions)
            enableAllChannelModeratedPermissions();

            // # Uncheck the Create Posts option for Guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);


            // # Check if the Guest user has the permission to create a post on that channel (Guest user should not have the permission)
            // * Guest user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('be.disabled');
            
            // # 5. As a system admin, check the option to allow Create Posts for Guests and then Save
            visitChannelConfigPage(channelName);

            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Guest user has the permission to create a post on that channel (Guest user should have the permission)
            // * Guest user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox').clear();
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'Write to autem');
            cy.findByTestId('post_textbox').should('not.be.disabled');
        });

        it('Create Post option for Members', () => {
            const channelName = 'autem';
            const loginAs = 'user-1';

            // # Go to system admin page and to channel configuration page of channel "autem"
            visitChannelConfigPage(channelName);

            // # Check all the boxes currently unchecked (align with the system scheme permissions)
            enableAllChannelModeratedPermissions();

            // # Uncheck the Create Posts option for Members
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Guest user has the permission to create a post on that channel (Guest user should not have the permission)
            // * Guest user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
            cy.findByTestId('post_textbox').should('be.disabled');
            
            // # 5. As a system admin, check the option to allow Create Posts for Members and then Save
            visitChannelConfigPage(channelName);

            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Member user has the permission to create a post on that channel (Member user should have the permission)
            // * Member user should see a message stating that this channel is read-only and the textbox area should be disabled
            cy.findByTestId('post_textbox').clear();
            cy.findByTestId('post_textbox_placeholder').should('have.text', 'Write to autem');
            cy.findByTestId('post_textbox').should('not.be.disabled');
        });
    });

    describe('MM-23102 - Post Reactions', () => {   
        before(() => {
            // Post a message
            visitAutemChannel('sysadmin');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');
            cy.findByTestId('post_textbox').clear().type('test123{enter}');

        });
        
        it('Post Reactions option for Guests', () => {
            const channelName = 'autem';
            const loginAs = 'guest';

            // # Go to system admin page and to channel configuration page of channel "autem"
            visitChannelConfigPage(channelName);

            // # Check all the boxes currently unchecked (align with the system scheme permissions)
            enableAllChannelModeratedPermissions();

            // # Uncheck the post reactions option for Guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Guest user has the permission to react to last post (Guest user should not have the permission)
            // * Guest user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });
            
            // # 5. As a system admin, check the option to allow Create reactions for Guests and then Save
            visitChannelConfigPage(channelName);

            enableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Guest user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Guest user has the permission to create a post on that channel (Guest user should have the permission)
            // * Guest user should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });
        });

        it('Post Reactions option for Members', () => {
            const channelName = 'autem';
            const loginAs = 'user-1';

            // # Go to system admin page and to channel configuration page of channel "autem"
            visitChannelConfigPage(channelName);

            // # Check all the boxes currently unchecked (align with the system scheme permissions)
            enableAllChannelModeratedPermissions();

            // # Uncheck the Create reactions option for Members
            disableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Member user has the permission to react to last post (Member user should not have the permission)
            // * Member user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });
            
            // # 5. As a system admin, check the option to allow Create reactions for Members and then Save
            visitChannelConfigPage(channelName);

            enableChannelModeratedPermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);

            // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
            saveConfig();

            // # Login as a Member user and visit the same channel
            visitAutemChannel(loginAs);

            // # Check if the Member user has the permission to create a post on that channel (Member user should have the permission)
            // * Member user should see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('exist');
            });
        });

        it('Post Reactions option removed for Guests and Members in System Scheme', () => {
            const channelName = 'autem';

            // # Go to system admin page and then go to the system scheme and remove post reaction option for guests and save
            goToSystemScheme();
            cy.get('#guests-reactions').click();
            saveConfig();

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);

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

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);

            // * Assert that post reaction is disabled for members and guest and a message is displayed
            cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledBoth').
            should('exist').
            and('have.text', 'Post reactions for members and guests are disabled in System Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS).should('be.disabled');

            // # Login as a Guest user and visit the same channel
            visitAutemChannel('guest');

            // # Check if the Guest user does not have the permission to react to last post
            // * Guest user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            // # Login as a Member user and visit the same channel
            visitAutemChannel('user-1');

            // # Check if the Member user does not have the permission to react to a post on that channel
            // * Member user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            // # Reset system scheme permissions back to default
            resetSystemSchemePermissionsToDefault();
        });

        // **** BLOCKED ***** GUEST PERMISSIONS DON'T EXIST ON TEAM OVERRIDE SCHEMES!
        // Some portions are commented out due to guests permissions to being available
        it('Post Reactions option removed for Guests & Members in Team Override Scheme', () => {
            const channelName = 'autem';
            const teamOverrideSchemeName = 'post_reactions';

            // # Go to system admin page and then create a new team scheme and remove guest permissions
            goToPermissionsAndCreateTeamOverrideScheme(teamOverrideSchemeName)

            // # Remove Post Reactions from guest permissions
            // **BLOCKED DOESNT EXIST***

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);

            // * Assert that post reaction is disabled for guest and not disabled for members and a message is displayed
            // cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledGuest').
            // should('exist').
            // and('have.text', 'Post reactions for guests are disabled in Team Scheme.');
            cy.findByTestId('create_reactions-members').should('not.be.disabled');
            // cy.findByTestId('create_reactions-guests').should('be.disabled');

            // # Go to system admin page and then go to the system scheme and remove post reaction option for all members and save
            deleteOrEditTeamScheme('post_reactions', 'edit');
            cy.get('#all_users-posts-reactions').click();
            saveConfig(false);

            // # Wait until the groups have been saved (since it redirects you)
            cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);

            // * Assert that post reaction is disabled for members and guest and a message is displayed
            // cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledBoth').
            // should('exist').
            // and('have.text', 'Post reactions for members and guests are disabled in Team Scheme.');
            cy.findByTestId('create_reactions-members').should('be.disabled');
            // cy.findByTestId('create_reactions-guests').should('be.disabled');

            // // # Login as a Guest user and visit the same channel
            // cy.apiLogin('guest');
            // cy.visit('/ad-1/channels/aut-8');

            // // # Check if the Guest user does not have the permission to react to last post
            // // * Guest user should not see the smiley face that allows a user to react to a post
            // cy.getLastPostId().then((postId) => {
            //     cy.get(`#post_${postId}`).trigger('mouseover');
            //     cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            // });

            // # Login as a Member user and visit the same channel
            visitAutemChannel('user-1')

            // # Check if the Member user does not have the permission to react to a post on that channel
            // * Member user should not see the smiley face that allows a user to react to a post
            cy.getLastPostId().then((postId) => {
                cy.get(`#post_${postId}`).trigger('mouseover');
                cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
            });

            deleteOrEditTeamScheme('post_reactions', 'delete');
        });
    });

    describe('MM-23102 - Manage Members', () => {
        it('No option to Manage Members for Guests', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // * Assert that Manage Members for Guests does not exist (checkbox is not there)
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');

            visitAutemChannel('guest');
            
            // # View members modal
            viewMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Manage Members option for Members', () => {
            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();
    
            visitAutemChannel('user-1');
            viewMembersModal('View');
    
            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
    
            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();
            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();
    
            visitAutemChannel('user-1');
            viewMembersModal('Manage')
    
            // * Add Members button does not exist
            cy.get('#showInviteModal').should('exist');
        });

        it('Manage Members option removed for Members in System Scheme', () => {
            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            // # Visit Autem channel page and turn off the Manage members for Members and then save
            visitAutemChannelConfigPage();
            // * Assert that Manage Members is disabled for members and a message is displayed
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('exist').
            and('have.text', 'Manage members for members are disabled in System Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');
    
            visitAutemChannel('user-1');
            viewMembersModal('View');
    
            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Manage Members option removed for Members in Team Override Scheme', () => {
            goToPermissionsAndCreateTeamOverrideScheme('manage_members');
            deleteOrEditTeamScheme('manage_members', 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);

            // # Wait until the groups have been saved (since it redirects you)
            cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting
            
            // * Assert that Manage Members is disabled for members and a message is displayed
            visitAutemChannelConfigPage();
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('exist').
            and('have.text', 'Manage members for members are disabled in manage_members Team Scheme.');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_GUESTS).should('not.exist');
    
            visitAutemChannel('user-1');
            viewMembersModal('View');
    
            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');

            deleteOrEditTeamScheme('manage_members', 'delete');
        });
    });

    describe('MM-23102 - Channel Mentions', () => {
        it('Channel Mentions option for Guests', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the channel mentions option for guests and save
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

            // # Check Member user has the permission to user special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageExist();

            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # check the channel mentions option for guests and save
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS);
            saveConfig();

            visitAutemChannel('user-1');

            // # Check Guest user has the permission to user special mentions like @all @channel and @here
            postChannelMentionsAndVerifySystemMessageNotExist();
        });

        //** BLOCKED AS CHANNEL MENTIONS FOR GUEST OR MEMBERS IS NOT AVAILABLE IN SYSTEM SCHEME YET !!! *** 
        // https://github.com/mattermost/mattermost-webapp/pull/4978 implements it
        it('Channel Mentions option removed for Guests & Members in System Scheme', () => {
        });

        // ** BLOCKED AS CHANNEL MENTIONS FOR GUEST OR MEMBERS IS NOT AVAILABLE TEAM SCEHEME!!! *** 
        // https://github.com/mattermost/mattermost-webapp/pull/4978 implements
        it('Channel Mentions option removed for Guests & Members in System Scheme', () => {
        });

        it('Channel Mentions option removed when Create Post is disabled', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the create posts option for guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);
            
            // * Ensure that channel mentions for guests is disabled and that a message is shown
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledGuestsDueToCreatePosts').
            should('have.text', 'Guests can not use channel mentions without the ability to create posts.');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS).should('be.disabled');

            // # check the create posts option for guests and uncheck for memebers
            enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);

            // * Ensure that channel mentions for members is disabled and that a message is shown
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledMemberDueToCreatePosts').
            should('have.text', 'Members can not use channel mentions without the ability to create posts.')
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS).should('be.disabled');

            // # Uncheck the create posts option for guests
            disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_GUESTS);

            // * Ensure that channel mentions for members and guests is disabled and that a message is shown
            cy.findByTestId('admin-channel_settings-channel_moderation-channelMentions-disabledBothDueToCreatePosts').
            should('have.text', 'Guests and members can not use channel mentions without the ability to create posts.');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS).should('be.disabled');
            cy.findByTestId(checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS).should('be.disabled');
        });

        it('Message when user without channel mention permission uses special channel mentions', () => {
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the channel mentions option for memebers and save 
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

            // # Uncheck the channel mentions option for memebers and save 
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
        }

        it('Effect of changing System Schemes on a Channel for which Channel Moderation Settings was modified', () => {
            resetSystemSchemePermissionsToDefault();
            // # Visit Channel page and Search for the channel.
            visitAutemChannelConfigPage();

            // # Uncheck the channel mentions option for guests and save
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            // # check the channel mentions option for guests and save
            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            visitAutemChannelConfigPage();
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitAutemChannel('user-1');

            // # View members modal
            viewMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Effect of changing System Schemes on a Channel for which Channel Moderation Settings was never modified', () => {
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            const randomChannelName = 'NeverModifiedChannel' + getRandomInt(1000);
            resetSystemSchemePermissionsToDefault();
            createNewChannel(randomChannelName, 'user-1');

            goToSystemScheme();
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig();

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(randomChannelName);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');


            visitChannel('user-1', randomChannelName.toLowerCase());

            // # View members modal
            viewMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
        });

        it('Effect of changing Team Override Schemes on a Channel for which Channel Moderation Settings was never modified', () => {
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            const randomChannelName = 'NeverModifiedChannel' + getRandomInt(1000);
            resetSystemSchemePermissionsToDefault();
            createNewChannel(randomChannelName, 'user-1');
            goToPermissionsAndCreateTeamOverrideScheme(`${randomChannelName}`);
            deleteOrEditTeamScheme(`${randomChannelName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(randomChannelName);
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('have.text', `Manage members for members are disabled in ${randomChannelName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitChannel('user-1', randomChannelName.toLowerCase());

            // # View members modal
            viewMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');
            deleteOrEditTeamScheme(`${randomChannelName}`, 'delete');
        });

        it('Effect of changing Team Override Schemes on a Channel for which Channel Moderation Settings was modified', () => {
            const channelName = 'autem';
            const teamOverrideSchemeName = channelName + getRandomInt(1000);
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            resetSystemSchemePermissionsToDefault();
            visitChannelConfigPage(channelName);
            disableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            enableChannelModeratedPermission(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS);
            saveConfig();

            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            visitAutemChannel();

            // # View members modal
            viewMembersModal('View');

            // * Add Members button does not exist
            cy.get('#showInviteModal').should('not.exist');

            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'delete');
        });


        it('Manage Members removed for Public Channels', () => {
            const channelName = 'autem';
            const teamOverrideSchemeName = channelName + getRandomInt(1000);
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            resetSystemSchemePermissionsToDefault();

            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-public_channel-manage_public_channel_members').click();
            cy.get('#all_users-private_channel-manage_private_channel_members').children().should('have.class', 'checked');
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            // # Turn it into a private channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('not.have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('not.be.disabled');

            // # Turn channel back to public channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'delete');
        });

        it('Manage Members removed for Private Channels / Permissions inherited when channel converted from Public to Private', () => {
            const channelName = 'autem';
            const teamOverrideSchemeName = channelName + getRandomInt(1000);
            // # Reset system scheme to default and create a new channel to ensure that this channels moderation settings have never been modified
            resetSystemSchemePermissionsToDefault();

            goToPermissionsAndCreateTeamOverrideScheme(`${teamOverrideSchemeName}`);
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'edit');
            cy.get('#all_users-private_channel-manage_private_channel_members').click();
            cy.get('#all_users-public_channel-manage_public_channel_members ').children().should('have.class', 'checked');
            saveConfig(false);

            // # Visit Channel page and Search for the channel.
            visitChannelConfigPage(channelName);
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('not.have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('not.be.disabled');

            // # Turn it into a private channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);

            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');
            cy.findByTestId('admin-channel_settings-channel_moderation-manageMembers-disabledMember').
            should('have.text', `Manage members for members are disabled in ${teamOverrideSchemeName} Team Scheme.`);
            cy.findByTestId(checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS).should('be.disabled');

            // # Turn channel back to public channel
            cy.findByTestId('allow-all-toggle').click();
            saveConfig(true, true);
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');
            deleteOrEditTeamScheme(`${teamOverrideSchemeName}`, 'delete');
        });

        // KNOWN TO FAIL! EDIT AND DELETE SHOW UP!
        // it('Check if user is allowed to Edit or Delete their own posts on a Read-Only channel', () => {
        //     // # Clean up and set back the permission to enabled
        //     visitChannelConfigPage('autem');
        //     enableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);
        //     saveConfig();

        //     visitAutemChannel('user-1');
        //     cy.findByTestId('post_textbox').clear().type('testMessage123123{enter}');
        //     cy.findByTestId('post_textbox_placeholder').should('not.have.text', 'This channel is read-only. Only members with permission can post here.');
        //     cy.findByTestId('post_textbox').should('not.be.disabled');

        //     visitChannelConfigPage('autem');
        //     disableChannelModeratedPermission(checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS);
        //     saveConfig();

        //     visitAutemChannel('user-1');

        //     // # Check if the user has the permission to create a post on that channel (Guest user should not have the permission)
        //     // * user should see a message stating that this channel is read-only and the textbox area should be disabled
        //     cy.findByTestId('post_textbox_placeholder').should('have.text', 'This channel is read-only. Only members with permission can post here.');
        //     cy.findByTestId('post_textbox').should('be.disabled');

        //     cy.getLastPostId().then((postId) => {
        //         cy.clickPostDotMenu(postId);
        //         cy.get(`#edit_post_${postId}`).should('not.exist');
        //         cy.get(`#delete_post_${postId}`).should('not.exist');
        //     });
        // });

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
