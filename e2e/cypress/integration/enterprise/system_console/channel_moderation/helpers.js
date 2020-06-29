// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getAdminAccount} from '../../../../support/env';

import {checkBoxes} from './constants';

// # Visits the channel configuration for a channel with channelName
export const visitChannelConfigPage = (channel) => {
    cy.apiAdminLogin();
    cy.visit('/admin_console/user_management/channels');
    cy.findByTestId('search-input').type(`${channel.name}{enter}`);
    cy.findByText('Edit').click();
    cy.wait(TIMEOUTS.ONE_SEC);
};

// # Disable a specific channel moderated permission in the channel moderation widget
export const disableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).scrollIntoView().should('be.visible').then((btn) => {
        if (btn.hasClass('checked')) {
            btn.click();
        }
    });
};

// # Saves channel config and navigates back to the channel config page if specified
export const saveConfigForChannel = (channelName = false, clickConfirmationButton = false) => {
    cy.get('#saveSetting').then((btn) => {
        if (btn.is(':enabled')) {
            btn.click();

            if (clickConfirmationButton) {
                cy.get('#confirmModalButton').click();
            }

            // # Make sure the save is complete by looking for the search input which is only visible on the teams index page
            cy.findByTestId('search-input').should('be.visible');

            if (channelName) {
                // # Search for the channel.
                cy.findByTestId('search-input').type(`${channelName}{enter}`);
                cy.findByText('Edit').click();
            }
        }
    });
};

// # Visits a channel as the member specified
export const visitChannel = (user, channel, team) => {
    cy.apiLogin(user);
    cy.visit(`/${team.name}/channels/${channel.name}`);
    cy.get('#postListContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
};

// # Checks to see if we got a system message warning after using @all/@here/@channel
export const postChannelMentionsAndVerifySystemMessageExist = (channelName) => {
    function getSystemMessage(text) {
        return `Channel notifications are disabled in ${channelName}. The ${text} did not trigger any notifications.`;
    }

    // # Type @all and post it to the channel
    cy.postMessage('@all');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', getSystemMessage('@all'));
    });

    // # Type @here and post it to the channel
    cy.postMessage('@here');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', getSystemMessage('@here'));
    });

    cy.postMessage('@channel');

    // # Type last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('include.text', getSystemMessage('@channel'));
    });
};

// # Enable a specific channel moderated permission in the channel moderation widget
export const enableChannelModeratedPermission = (permission) => {
    cy.findByTestId(permission).scrollIntoView().should('be.visible').then((btn) => {
        if (!btn.hasClass('checked')) {
            btn.click();
        }
    });
};

// # Checks to see if we did not get a system message warning after using @all/@here/@channel
export const postChannelMentionsAndVerifySystemMessageNotExist = (channel) => {
    function getSystemMessage(text) {
        return `Channel notifications are disabled in ${channel.name}. The ${text} did not trigger any notifications.`;
    }

    cy.postMessage('@all');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', getSystemMessage('@all'));
    });

    cy.postMessage('@here');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', getSystemMessage('@here'));
    });

    cy.postMessage('@channel');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted is NOT a system message informing us we are not allowed to use channel mentions
        cy.get(`#postMessageText_${postId}`).should('not.have.text', getSystemMessage('@channel'));
    });
};

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

// Clicks the save button in the system console page.
// waitUntilConfigSaved: If we need to wait for the save button to go from saving -> save.
// Usually we need to wait unless we are doing this in team override scheme
export const saveConfigForScheme = (waitUntilConfigSaved = true, clickConfirmationButton = false) => {
    // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
    cy.get('#saveSetting').then((btn) => {
        if (btn.is(':enabled')) {
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

// # Goes to the System Scheme page as System Admin
export const goToSystemScheme = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console/user_management/permissions/system_scheme');
};

// # Goes to the permissions page and creates a new team override scheme with schemeName
export const goToPermissionsAndCreateTeamOverrideScheme = (schemeName, team) => {
    cy.apiAdminLogin();
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId('team-override-schemes-link').click();
    cy.get('#scheme-name').type(schemeName);
    cy.findByTestId('add-teams').click();
    cy.get('#selectItems').click().type(team.display_name);
    cy.get('#multiSelectList').should('be.visible').children().first().click({force: true});
    cy.get('#saveItems').should('be.visible').click();
    saveConfigForScheme(false);
    cy.wait(TIMEOUTS.ONE_SEC);
};

// # Goes to the permissions page and clicks edit or delete for a team override scheme
export const deleteOrEditTeamScheme = (schemeDisplayName, editOrDelete) => {
    cy.apiAdminLogin();
    cy.visit('/admin_console/user_management/permissions');
    cy.findByTestId(`${schemeDisplayName}-${editOrDelete}`).click();
    if (editOrDelete === 'delete') {
        cy.get('#confirmModalButton').click();
    }
};

// # Clicks the View/Manage channel members for a channel (Text changes between View and Manage depending on your role in the channel)
export const viewManageChannelMembersModal = (viewOrManage) => {
    // # Click member count to open member list popover
    cy.get('#member_popover').click();

    cy.get('#member-list-popover').should('be.visible').within(() => {
        // # Click "View/Manage Members"
        cy.findByText(`${viewOrManage} Members`).click();
    });
};

// # Enable (check) all the permissions in the channel moderation widget through the API
export const enableDisableAllChannelModeratedPermissionsViaAPI = (channel, enable = true) => {
    cy.externalRequest(
        {
            user: getAdminAccount(),
            method: 'PUT',
            path: `channels/${channel.id}/moderations/patch`,
            data:
                [
                    {
                        name: 'create_post',
                        roles: {
                            members: enable,
                            guests: enable,
                        },
                    },
                    {
                        name: 'create_reactions',
                        roles: {
                            members: enable,
                            guests: enable,
                        },
                    },
                    {
                        name: 'manage_members',
                        roles: {
                            members: enable,
                        },
                    },
                    {
                        name: 'use_channel_mentions',
                        roles: {
                            members: enable,
                            guests: enable,
                        },
                    },
                ],
        },
    );
};

// # This goes to the system scheme and clicks the reset permissions to default and then saves the setting
export const resetSystemSchemePermissionsToDefault = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console/user_management/permissions/system_scheme');
    cy.findByTestId('resetPermissionsToDefault').click();
    cy.get('#confirmModalButton').click();
    saveConfigForScheme();
};

export const demoteToChannelOrTeamMember = (userId, id, channelsOrTeams = 'channels') => {
    cy.externalRequest({
        user: getAdminAccount(),
        method: 'put',
        path: `${channelsOrTeams}/${id}/members/${userId}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: false,
        },
    });
};

export const promoteToChannelOrTeamAdmin = (userId, id, channelsOrTeams = 'channels') => {
    cy.externalRequest({
        user: getAdminAccount(),
        method: 'put',
        path: `${channelsOrTeams}/${id}/members/${userId}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: true,
        },
    });
};

// # Disable (uncheck) all the permissions in the channel moderation widget
export const disableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

// # Enable (check) all the permissions in the channel moderation widget
export const enableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (!btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};
