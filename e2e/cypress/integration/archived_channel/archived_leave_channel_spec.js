// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import {getRandomId} from '../../utils';
import * as MESSAGES from '../../fixtures/messages';

import {createArchivedChannel} from './helpers';

describe('Leave an archived channel', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;
    const testArchivedMessage = `this is an archived post ${getRandomId()}`;

    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'second'}).then(({user: second}) => {
                cy.apiAddUserToTeam(testTeam.id, second.id);
                otherUser = second;
            });
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
            cy.postMessageAs({sender: testUser, message: testArchivedMessage, channelId: testChannel.id});
        });
    });

    it('should leave recently archived channel', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Archive the channel
        createArchivedChannel({prefix: 'archive-to-be-left-'}, ['Leaving this channel']).then(({channelName}) => {
            // # Switch to another channel
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.contains('#channelHeaderTitle', 'Town Square').should('be.visible');

            // # Switch back to the archived channel
            cy.visit(`/${testTeam.name}/channels/${channelName}`);
            cy.contains('#channelHeaderTitle', channelName).should('be.visible');

            // # Leave the channel
            cy.get('#channelHeaderDropdownIcon').click();
            cy.get('#channelLeaveChannel').click();

            // * Verify sure that we have switched channels
            cy.contains('#channelHeaderTitle', 'Town Square').should('be.visible');
        });
    });

    it('MM-T1670 Can view channel info for an archived channel', () => {
        // # archive channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.uiArchiveChannel();

        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Visit archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select View Info
        cy.get('#channelViewInfo button').click();

        // * Channel title is shown with archived icon
        cy.get('#channelInfoModalLabel span.icon__archive').should('be.visible');
        cy.contains('#channelInfoModalLabel strong', `${testChannel.display_name}`).should('be.visible');

        // * Channel URL is listed (non-linked text)
        cy.url().then((loc) => {
            cy.contains('div.info__value', loc).should('be.visible');
        });
    });

    it('MM-T1671 Can view members', () => {
        // # Open an archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select "View Members"
        cy.get('#channelViewMembers button').click();

        // * Channel Members modal opens
        cy.get('div#channelMembersModal').should('be.visible');

        // # Ensure there are no options to change channel roles or membership
        // * Membership or role cannot be changed
        cy.findByTestId('userListItemActions').should('not.be.visible');

        // # Use search box to refine list of members
        // * Search box works as before to refine member list
        cy.findAllByTestId('userListItemDetails').its('length').then((fullListLength) => {
            cy.get('#searchUsersInput').type(`${testUser.first_name}{enter}`);
            cy.findByTestId('userListItemDetails').its('length').then((filteredLength) => {
                expect(fullListLength).to.be.greaterThan(filteredLength);
            });
        });
    });

    it('MM-T1672_1 User can close archived channel (1/2)', () => {
        // # Open a channel that's not the town square
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # repeat searching and navigating to the archived channel steps 3 times.
        [1, 2, 3].forEach((i) => {
            // * ensure we are not on an archived channel
            cy.get('#channelInfoModalLabel span.icon__archive').should('not.be.visible');

            // # Search for a post in an archived channel
            cy.get('#searchBox').click().clear().type(`${testArchivedMessage}{enter}`);

            // # Open the archived channel by selecting Jump from search results and then selecting the link to move to the most recent posts in the channel
            cy.get('#searchContainer').should('be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.endsWith(`${testTeam.name}/channels/${testChannel.name}`); // wait for permalink to turn into channel url
            });

            if (i < 3) {
                // # Close an archived channel by clicking "Close Channel" button in the footer
                cy.get('#channelArchivedMessage button').click();
            } else {
                // # Click the header menu and select Close Channel
                cy.get('#channelHeaderDropdownButton button').click();
                cy.contains('li.MenuItem', 'Close Channel').click();
            }

            // * The user is returned to the channel they were previously viewing and the archived channel is removed from the drawer
            cy.get(`#sidebarItem_${testChannel.name}`).should('not.be.visible');
            cy.url().should('include', `${testTeam.name}/channels/off-topic`);
        });
    });

    it('MM-T1672_2 User can close archived channel (2/2)', () => {
        // # Add text to channel you land on (after closing the archived channel via Close Channel button)
        // * Able to add test
        cy.postMessage('some text');
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).should('be.visible');
        });
    });

    it('MM-T1673 Close channel after viewing two archived channels in a row', () => {
        const messageText = `archived text ${getRandomId()}`;

        cy.apiCreateChannel(testTeam.id, 'archived-is-not', 'archived-is-not');

        // # Create another channel with text and archive it
        createArchivedChannel({prefix: 'archive-'}, [messageText]).then(() => {
            cy.visit(`/${testTeam.name}/channels/off-topic`);

            // # Search for content from an archived channel
            cy.get('#searchBox').click().clear().type(`${testArchivedMessage}{enter}`);

            // # Open the channel from search results
            cy.get('#searchContainer').should('be.visible');
            cy.get('#loadingSpinner').should('not.be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.endsWith(`${testTeam.name}/channels/${testChannel.name}`); // wait for permalink to turn into channel url
            });

            // # Search for content from a different archived channel
            cy.get('#searchBox').click().clear().type(`${messageText}{enter}`);

            // # Open that channel from search results
            cy.get('#searchContainer').should('be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.match(/\/team-\w+\/channels\/archive-\w+$/); // wait for permalink to turn into channel url
            });

            // # Select "Close Channel"
            cy.get('#channelArchivedMessage button').click();

            // * User is returned to previously viewed (non-archived) channel
            cy.url().should('include', `${testTeam.name}/channels/off-topic`);
        });
    });

    it('MM-T1674 CTRL/CMD+K list public archived channels you are a member of', () => {
        createArchivedChannel({prefix: 'archived-'}, [`some text message ${getRandomId()}`]);
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Select CTRL/⌘+k) to open the channel switcher
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of a private channel on this team that has been archived which the test user belongs to
        cy.findByRole('textbox', {name: 'quick switch input'}).type('archived-');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * there should be public channels as well
        cy.get('#suggestionList').find('.icon-globe').should('be.visible');
    });

    it('MM-T1675 CTRL/CMD+K list private archived channels you are a member of', () => {
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Select CTRL/⌘+k) to open the channel switcher
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of a private channel on this team that has been archived which the test user belongs to
        cy.findByRole('textbox', {name: 'quick switch input'}).type('archived-');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * there should be public channels as well
        cy.get('#suggestionList').find('.icon-archive-outline').should('be.visible');
    });

    it('MM-T1676 CTRL/CMD+K does not show private archived channels you are not a member of', () => {
        const otherChannelName = 'archived-not-mine';

        // # As another user, create or locate a private channel that the test user is not a member of and archive the channel
        cy.apiLogout();
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.contains('#channelHeaderTitle', 'Off-Topic');
        createArchivedChannel({prefix: otherChannelName}, [`some text message ${getRandomId()}`]).then(() => {
            // # As the test user, select CTRL/CMD+K (or ⌘+k) to open the channel switcher
            cy.apiLogout();
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/off-topic`);
            cy.contains('#channelHeaderTitle', 'Off-Topic');
            cy.typeCmdOrCtrl().type('K', {release: true});

            // # Start typing the name of a private channel located above
            cy.findByRole('textbox', {name: 'quick switch input'}).type('archived-');

            cy.get('#suggestionList').should('be.visible');

            // * Private archived channels you are not a member above are not available on channel switcher
            cy.contains('#suggestionList', otherChannelName).should('not.exist');
            cy.get('#quickSwitchModalLabel button.close').click();
        });
    });

    it('MM-T1678 Open an archived channel using CTRL/CMD+K', () => {
        // # Select CTRL/CMD+K (or ⌘+K) to open the channel switcher
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of a public or private channel on this team that has been archived
        cy.findByRole('textbox', {name: 'quick switch input'}).type(testChannel.display_name);

        // # Select an archived channel from the list
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(testChannel.name).should('be.visible');
        cy.findByTestId(testChannel.name).click();

        // * Channel name visible in header
        cy.get('#channelHeaderTitle').should('contain', testChannel.display_name);

        // * Archived icon is visible in header
        cy.get('#channelHeaderInfo .icon-archive-outline').should('be.visible');

        // * Channel is listed In drawer
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');
        cy.get(`#sidebarItem_${testChannel.name} .icon-archive-outline`).should('be.visible');

        // * footer shows you are viewing an archived channel
        cy.get('#channelArchivedMessage').should('be.visible');
    });

    it('MM-T1679 Open an archived channel using jump from search results', () => {
        // # Create or locate post in an archived channel where the test user had permissions to edit channel details
        // generate a sufficiently large set of messages to make the toast appear
        const messageList = Array.from({length: 40}, (_, i) => `${i}. ${MESSAGES.SMALL} - ${getRandomId()}`);
        createArchivedChannel({prefix: 'archived-search-for'}, messageList).then(({channelName}) => {
            // # Locate the post in a search
            cy.get('#searchBox').click().clear().type(`${messageList[1]}{enter}`);

            // # Click jump to open an archive post in permalink view
            cy.get('#searchContainer').should('be.visible');
            cy.get('a.search-item__jump').first().click();

            // * Archived channel is opened in permalink view
            cy.get('.post--highlight').should('be.visible');

            // # Click on You are viewing an archived channel.
            cy.get('.toast__jump').should('be.visible').click();

            // * Channel is listed In drawer
            // * Channel name visible in header
            cy.get(`#sidebarItem_${channelName}`).should('be.visible');
            cy.get(`#sidebarItem_${channelName} .icon-archive-outline`).should('be.visible');

            // * Archived icon is visible in header
            cy.get('#channelHeaderInfo .icon-archive-outline').should('be.visible');

            // * Footer shows "You are viewing an archived channel. New messages cannot be posted. Close Channel"
            cy.get('#channelArchivedMessage').should('be.visible');
        });
    });
});

