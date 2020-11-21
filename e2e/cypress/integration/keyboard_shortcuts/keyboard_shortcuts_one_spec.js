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
    let thirdUser;
    let sysadmin;

    before(() => {
        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });

        // # Login as admin and visit town-square
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

            cy.apiCreateUser({prefix: 'third'}).then(({user: user1}) => {
                thirdUser = user1;

                cy.apiAddUserToTeam(testTeam.id, thirdUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, thirdUser.id);
                });
            });

            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1224 - CTRL/CMD+K - Open DM using mouse', () => {
        // # Type CTRL/CMD+K
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');

        let tempUser;
        cy.apiCreateUser({prefix: 'taemp-'}).then(({user: user1}) => {
            tempUser = user1;

            cy.apiAddUserToTeam(testTeam.id, tempUser.id).then(() => {
                cy.apiAddUserToChannel(testChannel.id, tempUser.id);
            });

            // # In the "Switch Channels" modal type the first character of the username
            cy.get('#quickSwitchInput').should('be.focused').type(tempUser.username.substring(0, 1)).wait(TIMEOUTS.HALF_SEC);

            // # verify that the list of users and channels suggestions is present
            cy.get('#suggestionList').should('be.visible').within(() => {
                // * Newly added username should be there in the search list; click it
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

        let tempUser;
        cy.apiCreateUser({prefix: 'temp-'}).then(({user: user1}) => {
            tempUser = user1;
            cy.apiAddUserToTeam(testTeam.id, tempUser.id);

            // # In the "Switch Channels" modal type the first chars of the test channel
            cy.get('#quickSwitchInput').should('be.focused').type(testChannel.name.substring(0, 3)).wait(TIMEOUTS.HALF_SEC);

            // # verify that the list of users and channels suggestions is present
            cy.get('#suggestionList').should('be.visible').within(() => {
                // * The channel the current user is not a member of should be there in the search list; click it
                cy.findByTestId(`${testChannel.name}`).scrollIntoView().should('exist').click().wait(TIMEOUTS.HALF_SEC);
            });

            // # Verify that we are in the right channel
            cy.get('#channelIntro').contains('.channel-intro__title', `Beginning of ${testChannel.display_name}`).should('be.visible');

            // # Verify that the right channel is displayed in LHS
            cy.contains('.sidebar-item', testChannel.display_name);

            // # Verify that the current user(sysadmin) created the channel
            cy.get('#channelIntro').contains('.channel-intro__content', `This is the start of the ${testChannel.display_name} channel, created by sysadmin`).should('be.visible');
        });
    });

    it('MM-T1231 - ALT+SHIFT+UP', () => {
        let privateChannel1;
        let privateChannel2;
        let publicChannel1;
        let publicChannel2;
        let dmChannel1;

        let favPublicChannel1;
        let favPrivateChannel1;
        let favDMChannel1;

        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Create two private channels
        cy.apiCreateChannel(testTeam.id, 'private', 'private', 'P').then(({channel}) => {
            privateChannel1 = channel;
            cy.apiAddUserToChannel(privateChannel1.id, otherUser.id);
        });

        cy.apiCreateChannel(testTeam.id, 'private', 'private', 'P').then(({channel}) => {
            privateChannel2 = channel;
            cy.apiAddUserToChannel(privateChannel2.id, otherUser.id);
        });

        // # Create two public channels
        cy.apiCreateChannel(testTeam.id, 'public', 'public').then(({channel}) => {
            publicChannel1 = channel;
            cy.apiAddUserToChannel(publicChannel1.id, otherUser.id);
        });

        cy.apiCreateChannel(testTeam.id, 'public', 'public').then(({channel}) => {
            publicChannel2 = channel;
            cy.apiAddUserToChannel(publicChannel2.id, otherUser.id);
        });

        // # Open a DM with other user
        cy.apiCreateDirectChannel([sysadmin.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
            cy.visit(`/${testTeam.name}/messages/@${otherUser.username}`);
            dmChannel1 = channel;
        });

        // # Set up FAVORITE channels
        cy.apiCreateChannel(testTeam.id, 'public', 'public').then(({channel}) => {
            favPublicChannel1 = channel;
            cy.apiAddUserToChannel(favPublicChannel1.id, otherUser.id);
            markAsFavorite(channel.name);
        });

        cy.apiCreateChannel(testTeam.id, 'private', 'private', 'P').then(({channel}) => {
            favPrivateChannel1 = channel;
            cy.apiAddUserToChannel(favPrivateChannel1.id, otherUser.id);
            markAsFavorite(channel.name);
        });

        // # Add a DM to Favorites
        cy.apiCreateDirectChannel([sysadmin.id, otherUser.id]).wait(TIMEOUTS.ONE_SEC).then(({channel}) => {
            console.log(JSON.stringify(channel));
            cy.visit(`/${testTeam.name}/messages/@${otherUser.username}`);
            favDMChannel1 = channel;
            markAsFavorite(channel.name);
        });

        cy.apiLogout();
        cy.apiLogin(otherUser).then(() => {
            cy.visit(`/${testTeam.name}/channels/off-topic`).wait(TIMEOUTS.FIVE_SEC);

            markAsFavorite(favPublicChannel1.name);
            markAsFavorite(favPrivateChannel1.name);
            markAsFavorite(favDMChannel1.name);

            //post messages
            cy.get('#publicChannelList').find('a.sidebar-item').each(($el) => {
                cy.wrap($el).as('channel');
                console.log($el[0]);
            });

            cy.get('#privateChannelList').find('a.sidebar-item').each(($el) => {
                cy.wrap($el).as('channel');
                console.log($el[0]);
            });

            // click on all the messages to make sure there are none left unread
            cy.get('#directChannelList').find('a.sidebar-item').each(($el) => {
                cy.wrap($el).as('channel');
                console.log($el[0]);
            });
        });

        // # Type CTRL+K to open 'Switch Channels' modal
        // cy.get('#post_textbox').type('{alt}shift}{up}').then( () => {
        //     // * Channel switcher hint should be visible
        //     cy.get('#quickSwitchHint').should('be.visible');
        //     cy.get('#quickSwitchInput').should('be.focused');
        // });
    });

    it('MM-T1232 - ALT+SHIFT+DOWN', () => {
    });

    it('MM-T1240 - CTRL/CMD+K: Open and close', () => {
        // # Type CTRL+K to open 'Switch Channels' modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('K').then(() => {
            // * Channel switcher hint should be visible
            cy.get('#quickSwitchHint').should('be.visible');
            cy.get('#quickSwitchInput').should('be.focused');
        });

        // # Type CTRL+K to close 'Switch Channels' modal
        cy.get('body').cmdOrCtrlShortcut('K');
        cy.get('#quickSwitchHint').should('not.be.visible');
    });

    it('MM-T1241 - CTRL/CMD+K: Unreads', () => {
    });

    it('MM-T1248 - CTRL/CMD+SHIFT+L - Set focus to center channel message box', () => {
        // open search box to change focus
        cy.get('#searchBox').focus().should('be.focused').then(() => {
            // # Type CTRL+SHIFT+L
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
            // # Type CTRL+SHIFT+L
            cy.get('body').cmdOrCtrlShortcut('{shift}L');
            cy.get('#post_textbox').should('be.focused');
        });
    });

    it('MM-T1252 - CTRL/CMD+SHIFT+A', () => {
        // # Type CTRL+SHIFT+A to open Account Settings modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('{shift}A');
        cy.get('#accountSettingsHeader').should('be.visible');

        // # Type CTRL+SHIFT+A to close Account Settings modal
        cy.get('body').cmdOrCtrlShortcut('{shift}A');
        cy.get('#accountSettingsHeader').should('not.be.visible');
    });

    it('MM-T1253 - CTRL/CMD+SHIFT+M', () => {
        cy.apiLogout();
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Trigger DM with a user
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // post in current channel
        cy.postMessage(`mention ${testUser.username} from DM`);

        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage(`mention ${testUser.username} from channel`);

        //TODO - post the message using the suggestion list

        // open search box
        cy.get('body').cmdOrCtrlShortcut('{shift}M');

        //TODO - check that the right mentions show up in the search box
    });

    it('MM-T1278 - CTRL/CMD+SHIFT+K', () => {
        // # Type CTRL+SHIFT+K to open Direct Messages modal
        cy.get('#post_textbox').cmdOrCtrlShortcut('{shift}K');
        cy.get('#moreDmModal').should('be.visible').contains('Direct Messages');

        // # Type CTRL+SHIFT+K to close Direct Messages modal
        cy.get('body').cmdOrCtrlShortcut('{shift}K');
        cy.get('#moreDmModal').should('not.be.visible');
    });

    function openDM(username) {
        cy.get('#addDirectChannel').click();
        cy.get('#selectItems').type(`${username}`);
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('#multiSelectList').findByText(`@${username}`).scrollIntoView().click();
        cy.get('#selectItems').findByText(`${username}`).scrollIntoView().should('be.visible');
        cy.findByText('Go').click();
    }

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

        // # mark it as Favorite
        cy.get('#toggleFavorite').click();
    }
});
