// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';
import {isMac} from '../../utils';

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Login as admin and visit town-square
        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/town-square`);
    });

    it('MM-T1239 - CTRL+/ and CMD+/ and /shortcuts', () => {
        // # Type CTRL/CMD+/
        cy.get('#post_textbox').cmdOrCtrlShortcut('/');

        // # Verify that the 'Keyboard Shortcuts' modal is open
        cy.get('#shortcutsModalLabel').should('be.visible');

        // # Verify that the 'Keyboard Shortcuts' modal displays the CTRL/CMD+U shortcut
        cy.get('.section').eq(2).within(() => {
            cy.findByText('Files').should('be.visible');
            cy.get('.shortcut-line').within(() => {
                if (isMac()) {
                    cy.findByText('⌘').should('be.visible');
                } else {
                    cy.findByText('CTRL').should('be.visible');
                }
                cy.findByText('U').should('be.visible');
            });
        });

        // # Type CTRL/CMD+/ to close the 'Keyboard Shortcuts' modal
        cy.get('body').cmdOrCtrlShortcut('/');
        cy.get('#shortcutsModalLabel').should('not.be.visible');

        // # Type /shortcuts
        cy.get('#post_textbox').clear().type('/shortcuts{enter}');
        cy.get('#shortcutsModalLabel').should('be.visible');

        // # Close the 'Keyboard Shortcuts' modal using the x button
        cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close').click();
        cy.get('#shortcutsModalLabel').should('not.be.visible');

        // # Type /shortcuts
        cy.get('#post_textbox').clear().type('/shortcuts{enter}');

        // # Close the 'Keyboard Shortcuts' modal by pressing ESC key
        cy.get('body').type('{esc}');
        cy.get('#shortcutsModalLabel').should('not.be.visible');
    });

    it('MM-T1254 - CTRL/CMD+UP; CTRL/CMD+DOWN', () => {
        const messagePrefix = 'hello from current user: ';
        let message;
        const count = 5;

        // # Post messages to the center channel
        for (let index = 0; index < count; index++) {
            message = messagePrefix + index;
            cy.postMessage(message);
        }

        for (let index = 0; index < count; index++) {
            // # Type CTRL/CMD+UP
            cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');

            // # Verify that the previous message is displayed
            message = messagePrefix + (4 - index);
            cy.get('#post_textbox').contains(message);
        }

        // # One extra CTRL/CMD+UP does not change the displayed message
        cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');
        message = messagePrefix + '0';
        cy.get('#post_textbox').contains(message);

        for (let index = 1; index < count; index++) {
            // # Type CTRL/CMD+DOWN
            cy.get('#post_textbox').cmdOrCtrlShortcut('{downarrow}');

            // # Verify that the next message is displayed
            message = messagePrefix + index;
            cy.get('#post_textbox').contains(message);
        }
    });

    it('MM-T1260 - UP arrow', () => {
        const message = 'Test';
        const editMessage = 'Edit Test';

        // # Post message text
        cy.get('#post_textbox').clear().type(message).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Edit to the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').clear().type(editMessage).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        cy.getLastPostId().then((postId) => {
            // * Post should have (edited)
            cy.get(`#postEdited_${postId}`).
                should('be.visible').
                should('contain', '(edited)');
        });
    });

    it('MM-T1273 - @[character]+TAB', () => {
        const userName = `${testUser.username}`;

        // # Enter the first characters of a user name
        cy.get('#post_textbox').should('be.visible').clear().type('@' + userName.substring(0, 5)).wait(TIMEOUTS.HALF_SEC);

        // # Select the focused on user from the list using TAB
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.focused().tab();
        });

        // # Verify that the correct user name has been selected
        cy.get('#post_textbox').should('be.visible').should('contain', userName);

        // # Clear the message box
        cy.get('#post_textbox').clear();
    });

    it('MM-T1274 - :[character]+TAB', () => {
        const emojiName = ':tomato';

        // # Enter the first characters of an emoji name
        cy.get('#post_textbox').should('be.visible').clear().type(emojiName.substring(0, 3)).wait(TIMEOUTS.HALF_SEC);

        // # Go down the list of emojis
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);
        cy.get('body').type('{downarrow}').wait(TIMEOUTS.HALF_SEC);

        // # Select the fourth emoji from the top using TAB
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.focused().tab();
        });

        // # Verify that the correct selection has been made
        cy.get('#post_textbox').should('be.visible').should('contain', emojiName);
    });

    it('MM-T1275 - SHIFT+UP', () => {
        const message = `hello${Date.now()}`;

        // # Post message to center channel
        cy.postMessage(message);

        // # Press SHIFT+UP
        cy.get('#post_textbox').type('{shift}{uparrow}');

        // # Verify that the RHS reply box is focused
        cy.get('#reply_textbox').should('be.focused');

        // * Verify that the recently posted message is shown in the RHS
        cy.getLastPostId().then((postId) => {
            cy.get(`#rhsPostMessageText_${postId}`).should('exist');
        });
    });

    it('MM-T1279 - Keyboard shortcuts menu item', () => {
        // # Click "Keyboard Shortcuts" at main menu
        cy.uiOpenMainMenu('Keyboard Shortcuts');

        const name = isMac() ? 'Keyboard Shortcuts⌘/' : 'Keyboard ShortcutsCtrl/';
        cy.findByRole('dialog', {name}).should('be.visible');
    });

    it('MM-T1575 - Ability to Switch Teams', () => {
        const count = 5;
        const teamNames = [];
        const teamDisplayNames = [];
        const channelNames = [];
        const channelDisplayNames = [];

        // Step #1
        cy.apiLogout();
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        for (let index = 0; index < count; index++) {
            teamNames.push('team' + index);
            teamDisplayNames.push('Team' + index);
            channelNames.push('channel' + index);
            channelDisplayNames.push('Channel' + index);

            cy.apiCreateTeam(teamNames[index], teamDisplayNames[index]).then(({team}) => {
                teamNames[index] = team.name;
                teamDisplayNames[index] = team.display_name;
                cy.apiCreateChannel(team.id, channelNames[index], channelDisplayNames[index]).then(({channel}) => {
                    channelNames[index] = channel.name;
                    channelDisplayNames[index] = channel.display_name;
                    cy.visit(`/${team.name}/channels/${channel.name}`);
                });
            });
        }

        for (let index = 0; index < count; index++) {
            // # Verify that we've switched to the correct team
            cy.get('#headerTeamName').should('contain', teamDisplayNames[count - index - 1]);

            // # Verify that we've switched to the correct channel
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayNames[count - index - 1]);

            // # Press CTRL/CMD+SHIFT+UP
            if (isMac()) {
                cy.get('body').type('{cmd}{option}', {release: false}).type('{uparrow}').type('{cmd}{option}', {release: true});
            } else {
                cy.get('body').type('{ctrl}{shift}', {release: false}).type('{uparrow}').type('{ctrl}{shift}', {release: true});
            }
        }

        for (let index = 0; index < count; index++) {
            // # Press CTRL/CMD+SHIFT+DOWN
            if (isMac()) {
                cy.get('body').type('{cmd}{option}', {release: false}).type('{downarrow}').type('{cmd}{option}', {release: true});
            } else {
                cy.get('body').type('{ctrl}{shift}', {release: false}).type('{downarrow}').type('{ctrl}{shift}', {release: true});
            }

            // # Verify that we've switched to the correct team
            cy.get('#headerTeamName').should('contain', teamDisplayNames[index]);

            // # Verify that we've switched to the correct channel
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayNames[index]);
        }

        for (let index = 2; index <= count + 1; index++) {
            // # Press CTRL/CMD+SHIFT+index
            if (isMac()) {
                cy.get('body').type('{cmd}{option}', {release: false}).type(String(index)).type('{cmd}{option}', {release: true});
            } else {
                cy.get('body').type('{ctrl}{shift}', {release: false}).type(String(index)).type('{ctrl}{shift}', {release: true});
            }

            // # Verify that we've switched to the correct team
            cy.get('#headerTeamName').should('contain', teamDisplayNames[index - 2]);

            // # Verify that we've switched to the correct channel
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayNames[index - 2]);
        }

        // Step #2
        cy.get('#channel-header').should('be.visible').then(() => {
            cy.get('#channelHeaderUserGuideButton').click();
            cy.get('.dropdown-menu').should('be.visible').then(() => {
                cy.get('#keyboardShortcuts').should('be.visible');
                cy.get('#keyboardShortcuts button').click();
                cy.get('#shortcutsModalLabel').should('be.visible');
            });
        });

        cy.get('.section').eq(0).within(() => {
            cy.findByText('Navigation').should('be.visible');
            cy.findByText('Previous team:').should('be.visible');
            cy.findAllByText('Next team:').should('be.visible');
            cy.findAllByText('Switch to a specific team:').should('be.visible');
        });
    });
});
