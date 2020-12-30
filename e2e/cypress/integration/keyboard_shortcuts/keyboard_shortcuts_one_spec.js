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

    it('MM-T1224 - CTRL/CMD+K - Open DM using mouse', () => {
        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        cy.apiCreateUser({prefix: 'temp-'}).then(({user: tempUser}) => {
            cy.apiAddUserToTeam(testTeam.id, tempUser.id).then(() => {
                cy.apiAddUserToChannel(testChannel.id, tempUser.id);
            });

            // # In the "Switch Channels" modal type the first character of the username
            cy.findByRole('textbox', {name: 'quick switch input'}).should('be.focused').type(tempUser.username.substring(0, 1)).wait(TIMEOUTS.HALF_SEC);

            // # Verify that the list of users and channels suggestions is present
            cy.get('#suggestionList').should('be.visible').within(() => {
                // * Newly created username should be there in the search list; click it
                cy.findByTestId(`${tempUser.username}`).scrollIntoView().should('exist').click().wait(TIMEOUTS.HALF_SEC);
            });

            // # Verify that we are in a DM channel
            cy.get('#channelIntro').should('be.visible').within(() => {
                cy.get('.channel-intro-profile').
                    should('be.visible').
                    and('have.text', tempUser.username);
                cy.get('.channel-intro-text').
                    should('be.visible').
                    and('contain', `This is the start of your direct message history with ${tempUser.username}.`).
                    and('contain', 'Direct messages and files shared here are not shown to people outside this area.');
            });

            // # Verify that the focus is on the message box
            cy.get('#post_textbox').should('be.focused');
        });
    });

    it('MM-T1227 - CTRL/CMD+K - Join public channel', () => {
        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        cy.apiCreateUser({prefix: 'temp-'}).then(({user: tempUser}) => {
            // # Add user to team but not to test channel
            cy.apiAddUserToTeam(testTeam.id, tempUser.id);

            // # In the "Switch Channels" modal type the first chars of the test channel name
            cy.findByRole('textbox', {name: 'quick switch input'}).should('be.focused').type(testChannel.name.substring(0, 3)).wait(TIMEOUTS.HALF_SEC);

            // # Verify that the list of users and channels suggestions is present
            cy.get('#suggestionList').should('be.visible').within(() => {
                // * The channel the current user is not a member of should be there in the search list; click it
                cy.findByTestId(`${testChannel.name}`).scrollIntoView().should('exist').click().wait(TIMEOUTS.HALF_SEC);
            });

            // # Verify that we are in the test channel
            cy.get('#channelIntro').contains('.channel-intro__title', `Beginning of ${testChannel.display_name}`).should('be.visible');

            // # Verify that the right channel is displayed in LHS
            cy.contains('.sidebar-item', testChannel.display_name);

            // # Verify that the current user(sysadmin) created the channel
            cy.get('#channelIntro').contains('.channel-intro__content', `This is the start of the ${testChannel.display_name} channel, created by sysadmin`).should('be.visible');
        });
    });

    it('MM-T1231 - ALT+SHIFT+UP', () => {
        cy.apiLogout();
        cy.apiLogin(testUser);

        cy.apiCreateTeam('team1', 'Team1').then(({team}) => {
            const privateChannels = [];
            const publicChannels = [];
            const dmChannels = [];

            // # Create two public channels
            for (let index = 0; index < 2; index++) {
                const otherUserId = otherUser.id;
                cy.apiCreateChannel(team.id, 'public', 'public').then(({channel}) => {
                    publicChannels.push(channel);
                    cy.apiAddUserToTeam(team.id, otherUserId).then(() => {
                        cy.apiAddUserToChannel(channel.id, otherUserId);
                    });
                });
            }

            // # Create two private channels
            for (let index = 0; index < 2; index++) {
                const otherUserId = otherUser.id;
                cy.apiCreateChannel(team.id, 'private', 'private', 'P').then(({channel}) => {
                    privateChannels.push(channel);
                    cy.apiAddUserToChannel(channel.id, otherUserId);
                });
            }

            // # Set up DM channel
            cy.apiCreateDirectChannel([testUser.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
                dmChannels.push(channel);
                cy.visit(`/${team.name}/channels/${testUser.id}__${otherUser.id}`);
                cy.get('#post_textbox').clear().type(`message from ${testUser.username}`).type('{enter}');
            });

            // # Add posts by second user to the newly created channels in the first team
            cy.apiLogout();
            cy.apiLogin(otherUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                cy.get('#sidebarItem_' + publicChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to public channel').type('{enter}');

                cy.get('#sidebarItem_' + privateChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to private channel').type('{enter}');

                cy.get('#sidebarItem_' + dmChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type(`direct message from ${otherUser.username}`).type('{enter}');
            });

            cy.apiLogout();
            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                // # Verify that the channels are unread
                cy.get(`#sidebarItem_${publicChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${privateChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${dmChannels[0].name}`).should('have.class', 'unread-title');

                // # Navigate to the bottom of the list of channels
                cy.get('#sidebarItem_' + dmChannels[0].name).scrollIntoView().click();
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + dmChannels[0].name).should('exist');
                });

                // # Press alt + shift + up
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + privateChannels[0].name).should('exist');
                });
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + publicChannels[0].name).should('exist');
                });

                // # No navigation - stay in place
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + publicChannels[0].name).should('exist');
                });
            });

            // # Handle favorite channels
            const favPrivateChannels = [];
            const favPublicChannels = [];
            const favDMChannels = [];

            // # Set up public favorite channel
            cy.apiCreateChannel(team.id, 'public', 'public').then(({channel}) => {
                favPublicChannels.push(channel);
                cy.apiAddUserToChannel(channel.id, otherUser.id);
                markAsFavorite(channel.name);
            });

            // # Set up private favorite channel
            cy.apiCreateChannel(team.id, 'private', 'private', 'P').then(({channel}) => {
                favPrivateChannels.push(channel);
                cy.apiAddUserToChannel(channel.id, otherUser.id);
                markAsFavorite(channel.name);
            });

            // # Set up DM favorite channel
            cy.apiCreateDirectChannel([testUser.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
                favDMChannels.push(channel);
                cy.visit(`/${team.name}/channels/${testUser.id}__${otherUser.id}`);
                cy.get('#post_textbox').clear().type(`message from ${testUser.username}`).type('{enter}');
                markAsFavorite(channel.name);
            });

            // # Add posts by second user to the newly created channels in the first team
            cy.apiLogout();
            cy.apiLogin(otherUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                cy.get('#sidebarItem_' + favPublicChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to public channel').type('{enter}');

                cy.get('#sidebarItem_' + favPrivateChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to private channel').type('{enter}');

                cy.get('#sidebarItem_' + favDMChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type(`direct message from ${otherUser.username}`).type('{enter}');
            });

            cy.apiLogout();
            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                // # Verify that the channels are unread - in the Favorites tab the unread channels are ordered alphabetically
                cy.get(`#sidebarItem_${favDMChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${favPrivateChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${favPublicChannels[0].name}`).should('have.class', 'unread-title');

                // # Navigate to the middle of the list of unread favorite channels
                cy.get('#sidebarItem_' + favPrivateChannels[0].name).scrollIntoView().click();
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favPrivateChannels[0].name).should('exist');
                });

                // # Press alt + shift + up
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favDMChannels[0].name).should('exist');
                });
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favPublicChannels[0].name).should('exist');
                });

                // # No navigation - stay in place
                cy.get('body').type('{alt}{shift}', {release: false}).type('{uparrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favPublicChannels[0].name).should('exist');
                });
            });
        });
    });

    it('MM-T1232 - ALT+SHIFT+DOWN', () => {
        cy.apiLogout();
        cy.apiLogin(testUser);

        cy.apiCreateTeam('team2', 'Team2').then(({team}) => {
            const privateChannels = [];
            const publicChannels = [];
            const dmChannels = [];

            // # Create two public channels
            for (let index = 0; index < 2; index++) {
                const otherUserId = otherUser.id;
                cy.apiCreateChannel(team.id, 'public', 'public').then(({channel}) => {
                    publicChannels.push(channel);
                    cy.apiAddUserToTeam(team.id, otherUserId).then(() => {
                        cy.apiAddUserToChannel(channel.id, otherUserId);
                    });
                });
            }

            // # Create two private channels
            for (let index = 0; index < 2; index++) {
                const otherUserId = otherUser.id;
                cy.apiCreateChannel(team.id, 'private', 'private', 'P').then(({channel}) => {
                    privateChannels.push(channel);
                    cy.apiAddUserToChannel(channel.id, otherUserId);
                });
            }

            // # Set up DM channel
            cy.apiCreateDirectChannel([testUser.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
                dmChannels.push(channel);
                cy.visit(`/${team.name}/channels/${testUser.id}__${otherUser.id}`);
                cy.get('#post_textbox').clear().type(`message from ${testUser.username}`).type('{enter}');
            });

            // # Add posts by second user to the newly created channels in the first team
            cy.apiLogout();
            cy.apiLogin(otherUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                cy.get('#sidebarItem_' + publicChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to public channel').type('{enter}');

                cy.get('#sidebarItem_' + privateChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to private channel').type('{enter}');

                cy.get('#sidebarItem_' + dmChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type(`direct message from ${otherUser.username}`).type('{enter}');
            });

            cy.apiLogout();
            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                // # Verify that the channels are unread
                cy.get(`#sidebarItem_${publicChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${privateChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${dmChannels[0].name}`).should('have.class', 'unread-title');

                // # Navigate to the top of the list of channels
                cy.get('#sidebarItem_' + publicChannels[0].name).scrollIntoView().click();
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + publicChannels[0].name).should('exist');
                });

                // # Press alt + shift + down
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + privateChannels[0].name).should('exist');
                });
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + dmChannels[0].name).should('exist');
                });

                // # No navigation - stay in place
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + dmChannels[0].name).should('exist');
                });
            });

            // # Handle favorite channels
            const favPrivateChannels = [];
            const favPublicChannels = [];
            const favDMChannels = [];

            // # Set up public favorite channel
            cy.apiCreateChannel(team.id, 'public', 'public').then(({channel}) => {
                favPublicChannels.push(channel);
                cy.apiAddUserToChannel(channel.id, otherUser.id);
                markAsFavorite(channel.name);
            });

            // # Set up private favorite channel
            cy.apiCreateChannel(team.id, 'private', 'private', 'P').then(({channel}) => {
                favPrivateChannels.push(channel);
                cy.apiAddUserToChannel(channel.id, otherUser.id);
                markAsFavorite(channel.name);
            });

            // # Set up DM favorite channel
            cy.apiCreateDirectChannel([testUser.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
                favDMChannels.push(channel);
                cy.visit(`/${team.name}/channels/${testUser.id}__${otherUser.id}`);
                cy.get('#post_textbox').clear().type(`message from ${testUser.username}`).type('{enter}');
                markAsFavorite(channel.name);
            });

            // # Add posts by second user to the newly created channels in the first team
            cy.apiLogout();
            cy.apiLogin(otherUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                cy.get('#sidebarItem_' + favPublicChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to public channel').type('{enter}');

                cy.get('#sidebarItem_' + favPrivateChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type('message to private channel').type('{enter}');

                cy.get('#sidebarItem_' + favDMChannels[0].name).scrollIntoView().click();
                cy.get('#post_textbox').clear().type(`direct message from ${otherUser.username}`).type('{enter}');
            });

            cy.apiLogout();
            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${team.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

                // # Verify that the channels are unread - in the Favorites tab the unread channels are ordered alphabetically
                cy.get(`#sidebarItem_${favDMChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${favPrivateChannels[0].name}`).should('have.class', 'unread-title');
                cy.get(`#sidebarItem_${favPublicChannels[0].name}`).should('have.class', 'unread-title');

                // # Navigate to the middle of the list of unread favorite channels
                cy.get('#sidebarItem_' + favPrivateChannels[0].name).scrollIntoView().click();
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favPrivateChannels[0].name).should('exist');
                });

                // # Press alt + shift + down
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favPublicChannels[0].name).should('exist');
                });
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favDMChannels[0].name).should('exist');
                });

                // # No navigation - stay in place
                cy.get('body').type('{alt}{shift}', {release: false}).type('{downarrow}').type('{alt}{shift}', {release: true});
                cy.get('.active').within(() => {
                    cy.get('#sidebarItem_' + favDMChannels[0].name).should('exist');
                });
            });
        });
    });

    it('MM-T1240 - CTRL/CMD+K: Open and close', () => {
        // # Type CTRL/CMD+K to open 'Switch Channels' modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('K').then(() => {
            // * Channel switcher hint should be visible and focused on
            cy.get('#quickSwitchHint').should('be.visible');
            cy.findByRole('textbox', {name: 'quick switch input'}).should('be.focused');
        });

        // # Type CTRL/CMD+K to close 'Switch Channels' modal
        cy.get('body').cmdOrCtrlShortcut('K');
        cy.get('#quickSwitchHint').should('not.be.visible');
    });

    it('MM-T1241 - CTRL/CMD+K: Unreads', () => {
        const count = 3;
        const team1Channels = [];
        const team2Channels = [];

        const otherUserId = otherUser.id;
        const otherUserMention = `@${otherUser.username}`;

        // # Post messages as testUser to first team channels
        cy.apiLogout();
        cy.apiLogin(testUser);
        cy.apiCreateTeam('team1', 'Team1').then(({team}) => {
            const channelName = 'channel1';
            const channelDisplayName = 'Channel1';

            for (let index = 0; index < count; index++) {
                cy.apiCreateChannel(team.id, channelName + index, channelDisplayName + index).then(({channel}) => {
                    team1Channels.push(channel);
                    cy.apiAddUserToTeam(team.id, otherUserId).then(() => {
                        cy.apiAddUserToChannel(channel.id, otherUserId);
                    });
                });
            }
            cy.visit(`/${team.name}/channels/town-square`);
            cy.wrap(team).as('team1');
        }).then(() => {
            cy.get('#sidebarItem_' + team1Channels[0].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message ' + otherUserMention).type('{enter}');

            cy.get('#sidebarItem_' + team1Channels[1].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message ').type('{enter}');

            cy.get('#sidebarItem_' + team1Channels[2].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message ' + otherUserMention).type('{enter}');
        });

        // # Post messages as testUser to second team channels
        cy.apiCreateTeam('team2', 'Team2').then(({team}) => {
            const channelName = 'channel2';
            const channelDisplayName = 'Channel2';

            for (let index = 0; index < count; index++) {
                cy.apiCreateChannel(team.id, channelName + index, channelDisplayName + index).then(({channel}) => {
                    team2Channels.push(channel);
                    cy.apiAddUserToTeam(team.id, otherUserId).then(() => {
                        cy.apiAddUserToChannel(channel.id, otherUserId);
                    });
                });
            }
            cy.visit(`/${team.name}/channels/town-square`);
            cy.wrap(team).as('team2');
        }).then(() => {
            cy.get('#sidebarItem_' + team2Channels[0].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message').type('{enter}');

            cy.get('#sidebarItem_' + team2Channels[1].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message ' + otherUserMention).type('{enter}');

            cy.get('#sidebarItem_' + team2Channels[2].name).scrollIntoView().click();
            cy.get('#post_textbox').type('message ' + otherUserMention).type('{enter}');
        });

        // # Login as otherUser
        cy.apiLogout();
        cy.apiLogin(otherUser);

        const baseCount = 1;
        const noMentions = 1;

        cy.get('@team1').then((team1) => {
            cy.visit(`/${team1.name}/channels/town-square`);

            // # Type CTRL/CMD+K
            cy.get('#post_textbox').cmdOrCtrlShortcut('K');

            // # Verify that the mentions in the channels of this team are displayed
            cy.get('#suggestionList').should('exist').children().should('have.length', count);

            cy.get('#suggestionList').find('.mentions__name').eq(0).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[0].display_name);
            cy.get('#suggestionList').find('.mentions__name').eq(0).within(() => {
                cy.get('.badge').should('be.visible').and('have.text', baseCount + noMentions);
            });
            cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

            cy.get('#suggestionList').find('.mentions__name').eq(1).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[1].display_name);
            cy.get('#suggestionList').find('.mentions__name').eq(1).within(() => {
                cy.get('.badge').should('be.visible').and('have.text', baseCount);
            });
            cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

            cy.get('#suggestionList').find('.mentions__name').eq(2).should('be.visible').and('have.class', 'suggestion--selected').and('have.attr', 'aria-label', team1Channels[2].display_name);
            cy.get('#suggestionList').find('.mentions__name').eq(2).within(() => {
                cy.get('.badge').should('be.visible').and('have.text', baseCount + noMentions);
            });
            cy.findByRole('textbox', {name: 'quick switch input'}).type('{downarrow}');

            cy.findByRole('textbox', {name: 'quick switch input'}).type(team1Channels[1].display_name).wait(TIMEOUTS.HALF_SEC);

            // # Verify that the channels of this team are displayed
            cy.get('#suggestionList').should('be.visible').children().within((el) => {
                cy.wrap(el).should('contain', team1Channels[1].display_name);
            });
        });
    });

    it('MM-T1248 - CTRL/CMD+SHIFT+L - Set focus to center channel message box', () => {
        // # Open search box to change focus
        cy.get('#searchBox').focus().should('be.focused').then(() => {
            // # Type CTRL/CMD+SHIFT+L
            cy.get('body').cmdOrCtrlShortcut('{shift}L');
            cy.get('#post_textbox').should('be.focused');
        });

        // # Post a message and open RHS
        const message = `hello${Date.now()}`;
        cy.postMessage(message);
        cy.getLastPostId().then((postId) => {
            // # Mouseover the post and click post comment icon.
            cy.clickPostCommentIcon(postId);
            cy.get('#reply_textbox').focus().should('be.focused');
        }).then(() => {
            // # Type CTRL/CMD+SHIFT+L
            cy.get('body').cmdOrCtrlShortcut('{shift}L');
            cy.get('#post_textbox').should('be.focused');
        });
    });

    it('MM-T1252 - CTRL/CMD+SHIFT+A', () => {
        // # Type CTRL/CMD+SHIFT+A to open 'Account Settings' modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('{shift}A');
        cy.get('#accountSettingsHeader').should('be.visible');

        // # Type CTRL/CMD+SHIFT+A to close 'Account Settings' modal
        cy.get('body').cmdOrCtrlShortcut('{shift}A');
        cy.get('#accountSettingsHeader').should('not.be.visible');
    });

    //Note: Test description mentions " or any word in "words that trigger mentions" is returned on search". The shortcut searches for the current username - it does not return the posts that mention @here, @all or @channel.
    it('MM-T1253 - CTRL/CMD+SHIFT+M', () => {
        const message1 = ' from DM channel';
        const message2 = ' from channel';
        const message3 = ' using suggestion';

        cy.apiCreateUser({prefix: 'temp'}).then(({user: tempUser}) => {
            const messagePrefix = `mention @${tempUser.username}`;

            // # Login as tempUser
            cy.apiLogout();
            cy.apiLogin(tempUser);

            cy.apiCreateTeam('team', 'Team').then(({team}) => {
                cy.apiCreateChannel(team.id, 'public', 'public').then(({channel}) => {
                    cy.visit(`/${team.name}/channels/town-square`);

                    // # Create DM channel with the second user
                    cy.apiCreateDirectChannel([tempUser.id, otherUser.id]).then(() => {
                        // # Visit the channel using the channel name
                        cy.visit(`/${team.name}/channels/${tempUser.id}__${otherUser.id}`);

                        // # Post in DM channel
                        cy.postMessage(messagePrefix + message1);
                    });

                    // # Post user name mention in this channel
                    cy.visit(`/${team.name}/channels/${channel.name}`);
                    cy.postMessage(messagePrefix + message2);

                    // # Type user name mention and post it to the channel
                    cy.get('#post_textbox').clear().type(messagePrefix + message3).type('{enter}{enter}');

                    // # Type "words that trigger mentions"
                    cy.postMessage('mention @here');
                    cy.postMessage('mention @all');
                    cy.postMessage('mention @channel');

                    // # Type CTRL/CMD+SHIFT+M to open search
                    cy.get('body').cmdOrCtrlShortcut('{shift}M');

                    // * Search box should appear with the current user name pre-populated
                    cy.get('#searchBox').should('have.attr', 'value', `@${tempUser.username} `);
                    cy.get('.sidebar--right__title').should('contain', 'Recent Mentions');

                    // # Verify that the correct number of mentions are returned
                    cy.get('#search-items-container').should('be.visible').children().should('have.length', 3);
                    cy.get('#search-items-container').within(() => {
                        // * Ensure that the mentions are visible in the RHS
                        cy.findAllByText(`@${tempUser.username}`).should('be.visible');
                    });
                });
            });
        });
    });

    it('MM-T1278 - CTRL/CMD+SHIFT+K', () => {
        // # Type CTRL/CMD+SHIFT+K to open 'Direct Messages' modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('{shift}K');
        cy.get('#moreDmModal').should('be.visible').contains('Direct Messages');

        // # Type CTRL/CMD+SHIFT+K to close 'Direct Messages' modal
        cy.get('body').cmdOrCtrlShortcut('{shift}K');
        cy.get('#moreDmModal').should('not.be.visible');
    });

    function markAsFavorite(channelName) {
        // # Visit the channel
        cy.get(`#sidebarItem_${channelName}`).scrollIntoView().click();

        cy.get('#postListContent').should('be.visible');

        // # Remove from Favorites if already set
        cy.get('#channelHeaderInfo').then((el) => {
            if (el.find('#toggleFavorite.active').length) {
                cy.get('#toggleFavorite').click();
            }
        });

        // # Mark it as Favorite
        cy.get('#toggleFavorite').click();
    }
});
