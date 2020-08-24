// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Group: @multi_team_and_dm

describe('Join an open team from a direct message link', () => {
    let openTeam;
    let testUserInOpenTeam;
    let publicChannelInOpenTeam;

    let secondTestTeam;
    let testUserOutsideOpenTeam;

    before(() => {
        cy.apiCreateTeam('mmt452-second-team', 'mmt452-second-team', 'I', true).then(({team}) => {
            secondTestTeam = team;

            // # Create test user in closed team
            cy.apiCreateUser().then(({user}) => {
                testUserOutsideOpenTeam = user;
                cy.apiAddUserToTeam(secondTestTeam.id, testUserOutsideOpenTeam.id);
            });
        });

        cy.apiCreateTeam('mmt452-open-team', 'mmt452-open-team', 'O', true).then(({team}) => {
            openTeam = team;

            // # Allow any user with an account on this server to join this team
            cy.apiPatchTeam(openTeam.id, {
                allow_open_invite: true,
            });

            cy.apiCreateChannel(openTeam.id, 'open-team-channel', 'open-team-channel').then((response) => {
                publicChannelInOpenTeam = response.body;
            });

            // # Create test user in open team
            cy.apiCreateUser().then(({user}) => {
                testUserInOpenTeam = user;
                cy.apiAddUserToTeam(openTeam.id, testUserInOpenTeam.id);

                // # Login as test user
                cy.apiLogin(testUserInOpenTeam);
            });
        });
    });

    it('MM-T452 User with no teams should be able to join an open team from a link in direct messages', () => {
        // # View 'off-topic' channel
        cy.visit(`/${openTeam.name}/channels/${publicChannelInOpenTeam.name}`);

        // * Expect channel title to match title passed in argument
        cy.get('#channelHeaderTitle').
            should('be.visible').
            and('contain.text', publicChannelInOpenTeam.display_name);

        // # Copy full url to channel
        cy.url().then((openTeamChannelUrl) => {
            // # From the 'Direct Messages' menu, send the URL of the public channel to the user outside the team
            sendDirectMessageToUser(testUserOutsideOpenTeam, openTeamChannelUrl);

            // # Logout as test user
            cy.apiLogout();

            // # Login as user outside team
            cy.apiLogin(testUserOutsideOpenTeam);

            // # Reload the page to ensure the new session is active
            cy.reload();

            // # Open direct message from the user in the open team (testUserInOpenTeam)
            cy.get(`a[href="/${secondTestTeam.name}/messages/@${testUserInOpenTeam.username}"]`).
                click();

            // * Expect channel title to contain the username (ensures we opened the right DM)
            cy.get('#channelHeaderTitle').
                should('be.visible').
                and('contain.text', `${testUserInOpenTeam.username}`);

            // # Click on URL sent by the user in the open team
            cy.findByTestId('postContent').
                first().
                get(`a[href="${openTeamChannelUrl}"]`).
                click();

            cy.url().should('equal', openTeamChannelUrl);
        });

        // * Expect the current team's display name to match the open team's display name
        cy.get('#headerTeamName').
            should('be.visible').
            and('have.text', openTeam.display_name);

        // * Expect channel title to be 'Off-Topic'
        cy.get('#channelHeaderTitle').
            should('be.visible').
            and('contain.text', publicChannelInOpenTeam.display_name);
    });
});

const sendDirectMessageToUser = (user, message) => {
    // # Open the direct messages dialog
    cy.get('#addDirectChannel').click();

    // # Type username
    cy.get('#selectItems input').
        should('be.enabled').
        type(`@${user.username}`, {force: true});

    // * Expect user count in the list to be 1
    cy.get('#multiSelectList').
        should('be.visible').
        children().
        should('have.length', 1);

    // # Select first user in the list
    cy.get('body').
        type('{downArrow}').
        type('{enter}');

    // # Click on "Go" in the group message's dialog to begin the conversation
    cy.get('#saveItems').click();

    // * Expect the channel title to be the user's username
    // In the channel header, it seems there is a space after the username, justifying the use of contains.text instead of have.text
    cy.get('#channelHeaderTitle').should('be.visible').and('contain.text', user.username);

    // # Type message and send it to the user
    cy.get('#post_textbox').
        type(message).
        type('{enter}');
};
