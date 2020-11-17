// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Notifications', () => {
    let user1;
    let user2;
    let team1;
    let team2;
    let testTeam1TownSquareUrl;
    let testTeam2TownSquareUrl;
    let siteName;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            team1 = team;
            user1 = user;
            testTeam1TownSquareUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;
                cy.apiAddUserToTeam(team.id, user2.id);
            });

            cy.apiCreateTeam('team-b', 'Team B').then(({team: anotherTeam}) => {
                team2 = anotherTeam;
                testTeam2TownSquareUrl = `/${team2.name}/channels/town-square`;
                cy.apiAddUserToTeam(team2.id, user1.id);
                cy.apiAddUserToTeam(team2.id, user2.id);
            });

            cy.apiGetConfig().then(({config}) => {
                siteName = config.TeamSettings.SiteName;
            });

            // # Remove mention notification (for initial channel).
            cy.apiLogin(user1);
            cy.visit(testTeam1TownSquareUrl);
            cy.get('#publicChannelList').get('.unread-title').click();
            cy.apiLogout();
        });
    });

    it('MM-T556 Browser tab and team sidebar notification - no unreads/mentions', () => {
        // # User 1 views team A
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);

        cy.title().should('include', `Town Square - ${team1.display_name} ${siteName}`);

        // * Browser tab shows channel name with no unread indicator
        cy.get(`#${team1.name}TeamButton`).parent('.unread').should('not.be.visible');
        cy.get('.badge').should('not.be.visible');

        // * No unread/mention indicator in team sidebar
        cy.get(`#${team2.name}TeamButton`).parent('.unread').should('not.be.visible');
        cy.get('.badge').should('not.be.visible');
    });

    it('MM-T560_1 Browser tab and team sidebar unreads and mentions - Mention in different team', () => {
        // # User 1 views team A
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Return to town square
        cy.visit(testTeam1TownSquareUrl);

        // * Check for no unreads or mentions
        cy.get('.unread-title').should('not.exist');

        //* Favicons should be default(blue)
        verifyFaviconEquals('favicon-default-16x16.png');

        // # Have the other user post an at-mention for you in any channel on team B
        cy.apiGetChannelByName(team2.name, 'off-topic').then(({channel}) => {
            cy.postMessageAs({sender: user2, message: `@${user1.username}`, channelId: channel.id});
        });

        cy.wait(TIMEOUTS.HALF_SEC);

        // * Browser tab should displays (1) * channel - [team name] Mattermost
        cy.title().should('include', `(1) Town Square - ${team1.display_name} ${siteName}`);

        // * Team sidebar: Small dot left of team B icon in team sidebar
        cy.get(`#${team2.name}TeamButton`).parent('.unread').should('be.visible').within(() => {
            // * Team sidebar: a mention badge in top right corner of the badge with number "1"
            cy.get('.badge').contains('1');
        });

        // * Favicon should turn red when there are mentions indicated
        verifyFaviconEquals('favicon-mentions-16x16.png');
    });

    it('MM-T560_2 Team sidebar icon - Badge with mention count increments when added to channel', () => {
        // # User 1 view and remain on team A
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);

        // * Browser tab should displays (1) * channel - [team name] Mattermost (for verify count increase)
        cy.title().should('include', `(1) Town Square - ${team1.display_name} ${siteName}`);

        // # Have another user view team B
        cy.apiLogin(user2);
        cy.visit(testTeam2TownSquareUrl);
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Create a new channel
        cy.get('#createPublicChannel').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#newChannelName').should('be.visible').type('new-channel');
        cy.get('#submitNewChannel').click();
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Invites User 1
        cy.get('#member_popover').should('be.visible').click();
        cy.contains('Manage Members').click();
        cy.contains('Add Members').click();
        cy.contains(`${user1.username}`).click();
        cy.get('#saveItems').click();
        cy.wait(TIMEOUTS.HALF_SEC);

        // * User 1 should be added.
        cy.getLastPost().
            should('contain', `@${user1.username}`).
            should('contain', 'added to the channel');

        // # Switch to User 1 and visit the town-square
        cy.apiLogout();
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);

        // * Title should be increased
        // * Browser tab should displays (1) * channel - [team name] Mattermost
        cy.title().should('include', `(2) Town Square - ${team1.display_name} ${siteName}`);

        // * Team sidebar: Small dot left of team B icon in team sidebar
        cy.get(`#${team2.name}TeamButton`).should('be.visible').within(() => {
            // * Team sidebar: a mention badge in top right corner of the badge with number "1"
            cy.get('.badge').contains('2');
        });
    });

    function verifyFaviconEquals(expectedFixture) {
        cy.get('link[rel=icon]').should('have.attr', 'href').then((defaultFaviconUrl) => {
            cy.fixture(expectedFixture).then((imageData) => {
                cy.request({url: defaultFaviconUrl, encoding: 'base64'}).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(imageData);
                });
            });
        });
    }
});
