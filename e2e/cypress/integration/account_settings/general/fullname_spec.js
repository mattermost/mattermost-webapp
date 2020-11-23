// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import {getRandomId} from '../../../utils';

describe('Account Settings > Sidebar > General', () => {
    // # number to identify particular user
    const randomId = getRandomId();

    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            // # Login as test user, visit town-square and go to the Account Settings
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
            cy.toAccountSettingsModal();

            // # Click General button
            cy.get('#generalButton').click();

            // # Open Full Name section
            cy.get('#nameDesc').click();

            // * Set first name value
            cy.get('#firstName').clear().type(`정트리나${randomId}/trina.jung/집단사무국(CO)`);

            // # save form
            cy.get('#saveSetting').click();
        });
    });

    it('MM-T183 Filtering by first name with Korean characters', () => {
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # type in user`s firstName substring
        cy.get('#post_textbox').clear().type(`@정트리나${randomId}`);

        cy.findByTestId(testUser.username, {exact: false}).within((name) => {
            cy.wrap(name).prev('.suggestion-list__divider').
                should('have.text', 'Channel Members');
            cy.wrap(name).find('.mention--align').
                should('have.text', `@${testUser.username}`);
            cy.wrap(name).find('.ml-2').
                should('have.text', `정트리나${randomId}/trina.jung/집단사무국(CO) ${testUser.last_name} (${testUser.nickname})`);
        });

        // # Press tab on text input
        cy.get('#post_textbox').tab();

        // # verify that after enter user`s username match
        cy.get('#post_textbox').should('have.value', `@${testUser.username} `);

        // # click enter in post textbox
        cy.get('#post_textbox').type('{enter}');

        // # verify that message has been post in chat
        cy.get(`[data-mention="${testUser.username}"]`).
            last().
            scrollIntoView().
            should('be.visible');
    });
});

describe('Account Settings -> General -> Full Name', () => {
    let testUser;

    before(() => {
        cy.apiAdminLogin();

        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();
    });

    it('MM-T2043 Enter first name', () => {
        // # Click "Edit" to the right of "Full Name"
        cy.get('#nameEdit').should('be.visible').click();

        // # Clear the first name
        cy.get('#firstName').clear();

        // # Type a new first name
        cy.get('#firstName').should('be.visible').type(testUser.first_name + '_new');

        // # Save the settings
        cy.get('#saveSetting').click();

        // * Check that the first name was correctly updated
        cy.get('#nameDesc').should('be.visible').should('contain', testUser.first_name + '_new ' + testUser.last_name);
    });
});

describe('MM-30354 Automate backlogs - Account Settings > Full Name', () => {
    let testTeam;
    let firstUser;
    let secondUser;
    const firstName = 'This Is a Long Name';
    const lastName = 'That Should Truncate';

    before(() => {
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            firstUser = user;
            cy.apiCreateUser().then(({user: user1}) => {
                secondUser = user1;
                cy.apiAddUserToTeam(testTeam.id, secondUser.id);
            });
        });
    });
    it('MM-T2046 Full Name - Truncated in popover', () => {
        // # Go to Account Settings -> General -> Full Name -> Edit
        cy.apiLogin(firstUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.toAccountSettingsModal();

        // # Click General button
        cy.get('#generalButton').click();

        // # Open Full Name section
        cy.get('#nameDesc').click();

        // # Enter First Name `This Is a Very Long Name`
        cy.get('#firstName').clear().type(firstName);

        // # Enter Last Name `That Should Truncate`
        cy.get('#lastName').clear().type(lastName);

        // # Save
        cy.get('#saveSetting').click();

        // * Full name field shows first and last name.
        cy.contains('#nameDesc', `${firstName} ${lastName}`);
    });
    it('MM-T2047 Truncated in popover (visual verification)', () => {
        cy.get('#accountSettingsHeader button.close').click();

        // # open user profile popover
        cy.postMessage(`this is a test message ${getRandomId()}`);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).should('be.visible');
            cy.get(`#post_${postId} img`).click();
            cy.get('#user-profile-popover').should('be.visible');

            // * Popover user name should show truncated to 'This Is a Long Name That Should Tr...'
            cy.findByTestId(`popover-fullname-${firstUser.username}`).should('have.css', 'text-overflow', 'ellipsis');

            // cy.contains('#user-profile-popover strong', `${firstName} ${lastName}`).and('have.css', 'text-overflow', 'ellipsis');
        });
    });
    it('MM-T2048 Empty full name: @ still displays before username', () => {
        // # Open any user list ("View Members", "Add Members", "Manage Members", ..)
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click view members
        cy.get('#viewMembers').should('be.visible').click();

        // # Find a user who hasn't set their full name
        cy.get('.modal-title').should('be.visible');
        cy.get('#searchUsersInput').should('be.visible').type(secondUser.nickname);

        // * Username is preceeded with `@`, consistent with other users
        cy.contains('button.user-popover', `@${secondUser.username}`);
    });
});
