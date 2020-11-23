// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

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

        // # Verify that the 'Keyboard Shortcuts' modal displays ths CTRL+U shortcut
        cy.get('.section').eq(2).within(() => {
            cy.findByText('Files').should('be.visible');
            cy.get('.shortcut-line').within(() => {
                if (cy.isMac()) {
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

        // # Close the 'Keyboard Shortcuts' modal using the x
        cy.get('.modal-header button.close').should('have.attr', 'aria-label', 'Close').click();
        cy.get('#shortcutsModalLabel').should('not.be.visible');

        // # Type /shortcuts
        cy.get('#post_textbox').clear().type('/shortcuts{enter}');

        // # Close the 'Keyboard Shortcuts' modal by pressing ESC
        cy.get('body').type('{esc}');
        cy.get('#shortcutsModalLabel').should('not.be.visible');
    });

    it('MM-T1254 - CTRL/CMD+UP; CTRL/CMD+DOWN', () => {
        let message;
        const count = 5;

        // # Post 5 messages
        for (let index = 0; index < count; index++) {
            message = 'hello from current user: ' + index;
            cy.postMessage(message);
        }

        for (let index = 0; index < count; index++) {
            // # Type CTRL/CMD + UP
            cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');
            message = 'hello from current user: ' + (4 - index);
            cy.get('#post_textbox').contains(message);
        }

        // # One exta CTRL/CMD + UP does not change the displayed message
        cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');
        message = 'hello from current user: 0';
        cy.get('#post_textbox').contains(message);

        for (let index = 1; index < count; index++) {
            // # Type CTRL/CMD + DOWN
            cy.get('#post_textbox').cmdOrCtrlShortcut('{downarrow}');
            message = 'hello from current user: ' + index;
            cy.get('#post_textbox').contains(message);
        }
    });

    // // CANNOT BE DONE(?)
    // it('MM-T1258 - CTRL/CMD+U', () => {
    //     // # Type CTRL/CMD+U
    //     cy.get('body').cmdOrCtrlShortcut('U');
    //     cy.get('input').attachFile('mattermost-icon.png');

    //     cy.getLastPostId().then((postId) => {
    //         cy.get(`#${postId}_message`).findByTestId('fileAttachmentList').children().should('have.length', '1');
    //     });
    // });

    // // CANNOT BE DONE(?)
    // it('MM-T1259 - BROWSER BACK: ALT+LEFT or RIGHT / CMD+[ or ]', () => {
    //     // # Visit initially the 'Off Topic' channel
    //     cy.visit(`/${testTeam.name}/channels/off-topic`);

    //     // # Navigate to the 'Town Square' channel
    //     cy.visit(`/${testTeam.name}/channels/town-square`);

    //     //cy.get('#sidebarItem_town-square').scrollIntoView().click();
    //     cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    //     cy.get('#headerInfo button').focus();

    //     // # Type CTRL/CMD+[ (Mac) or ALT+LEFT (Windows)
    //     if (cy.isMac()) {
    //         cy.get('#post_textbox').type('{cmd}', {release: false, delay: 1000}).type('[', {delay: 1000}).type('{cmd}', {release: true}).wait(TIMEOUTS.HALF_SEC);
    //     } else {
    //         cy.get('#post_textbox').type('{alt}', {release: false, delay: 1000}).type('{leftarrow}').type('{alt}', {release: true}).wait(TIMEOUTS.HALF_SEC);
    //     }

    //     // # Verify that we are back to 'Off Topic' channel
    //     cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Off-Topic');
    //     cy.get('#headerInfo button').focus();

    //     // # Type CTRL/CMD+] (Mac) or ALT+RIGHT (Windows)
    //     if (cy.isMac()) {
    //         cy.get('#post_textbox').type('{cmd}', {release: false}).type(']').type('{cmd}', {release: true}).wait(TIMEOUTS.HALF_SEC);
    //     } else {
    //         cy.get('#post_textbox').type('{alt}', {release: false}).type('{rightarrow}').type('{alt}', {release: true}).wait(TIMEOUTS.HALF_SEC);
    //     }

    //     // # Verify that we are back to 'Town Square' channel
    //     cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    // });

    it('MM-T1260 - UP arrow', () => {
        const message = 'Test';
        const message1 = 'Reply';

        // # Post message text
        cy.get('#post_textbox').clear().type(message).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Reply to the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });
    });

    it('MM-T1273 - @[character]+TAB', () => {
        const userName = `@${testUser.username}`;

        // # Enter the first characters of a user name
        cy.get('#post_textbox').should('be.visible').clear().type(userName.substring(0, 5)).wait(TIMEOUTS.HALF_SEC);

        // # Select the selected user from the list using TAB
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.focused().tab();
        });

        // # Verify that the correct selection has been made
        cy.get('#post_textbox').should('be.visible').should('contain', `${testUser.username}`);

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

        // # Post message
        cy.postMessage(message);

        cy.get('#post_textbox').type('{shift}{uparrow}');
        cy.get('#reply_textbox').type('{shift}{uparrow}').should('be.focused');

        // * Verify that the recently posted message is shown in the RHS
        cy.getLastPostId().then((postId) => {
            cy.get(`#rhsPostMessageText_${postId}`).should('exist');
        });
    });

    it('MM-T1279 - Keyboard shortcuts menu item', () => {
        cy.get('#channel-header').should('be.visible').then(() => {
            cy.get('#channelHeaderUserGuideButton').click();
            cy.get('.dropdown-menu').should('be.visible').then(() => {
                cy.get('#keyboardShortcuts').should('be.visible');
                cy.get('#keyboardShortcuts button').click();
                cy.get('#shortcutsModalLabel').should('be.visible');
            });
        });
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
        cy.visit(`/${testTeam.name}/channels/town-square`).wait(TIMEOUTS.HALF_SEC);

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
                    cy.visit(`/${team.name}/channels/${channel.name}`).wait(TIMEOUTS.HALF_SEC);
                });
            });
        }

        for (let index = 0; index < count; index++) {
            // # Verify that we've switched to the correct team
            cy.get('#headerTeamName').should('contain', teamDisplayNames[count - index - 1]);

            // # Verify that we've switched to the correct channel
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', channelDisplayNames[count - index - 1]);

            // # Press ctrl + shift + up
            if (cy.isMac()) {
                cy.get('body').type('{cmd}{option}', {release: false}).type('{uparrow}').type('{cmd}{option}', {release: true});
            } else {
                cy.get('body').type('{ctrl}{shift}', {release: false}).type('{uparrow}').type('{ctrl}{shift}', {release: true});
            }
        }

        // Step #2 - not clear what are the "new shortcuts"
        cy.get('#channel-header').should('be.visible').then(() => {
            cy.get('#channelHeaderUserGuideButton').click();
            cy.get('.dropdown-menu').should('be.visible').then(() => {
                cy.get('#keyboardShortcuts').should('be.visible');
                cy.get('#keyboardShortcuts button').click();
                cy.get('#shortcutsModalLabel').should('be.visible');
            });
        });
    });
});
