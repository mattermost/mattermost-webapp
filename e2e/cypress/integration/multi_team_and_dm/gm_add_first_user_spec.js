// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Stage: @prod
// Group: @multi_team_and_dm

describe('Multi-user group messages', () => {
    let testUser;
    let testTeam;

    before(() => {
        // # Create a new team
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            // # Add 3 users to the team that should be alphabetically sorted
            ['0aadam', '0aabadam', 'beatrice'].forEach((prefix) => {
                createTestUser(prefix, team);
            });
        });
    });

    it('MM-T459 Group Messaging: Add first user', () => {
        const searchTerm = '0aa';

        // # Login as test user
        cy.apiLogin(testUser);

        // # Go to town-square channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open the 'Direct messages' dialog
        cy.get('#addDirectChannel').
            click();

        // # Start typing part of a username that matches previously created users
        cy.get('#selectItems input').
            type(searchTerm, {force: true});

        // * Expect user list to only contain usernames matching the query term and to be sorted alphabetically
        expectUserListSortedAlphabetically(searchTerm);

        // # With the arrow and enter keys, select the first user that matches our search query
        cy.get('body').
            type('{downarrow}').
            type('{enter}');

        // * Expect to have the selected user's username to be displayed inside the search input
        cy.get('.react-select__multi-value').
            should('be.visible').
            and('have.length', 1).
            then(($selectedUser) => {
                // # Get the selected user's username
                const selectedUserName = $selectedUser.text();

                // * Expect user list to not contain selected user, not be filtered, but still in alphabetical order
                expectUserListSortedAlphabetically(selectedUserName, true);
            });

        // * Expect to have a remove button ('x') present next to the selected username (previous step)
        cy.get('.react-select__multi-value__remove').
            should('be.visible').
            and('have.length', 1);

        // * Expect search bar to have focus
        cy.get('.react-select__multi-value').next().find('input').should('have.focus');

        // * Expect previous search term to be cleared from search bar
        cy.get('#selectItems input').should('have.text', '');

        // * Expect the help section showing that we 6 more people can be added to the message
        cy.get('#multiSelectHelpMemberInfo').
            should('be.visible').
            and('contain.text', 'You can add 6 more people');
    });
});

// Helper functions

/**
 * Check that the user list inside the direct messages dialog is sorted alphabetically
 *  - Numbers are included in the sorting logic
 *  - Lowercase letters come before uppercase letters
 * @param {string?} filterString Optional, ensure all results in the list match a certain string, an autocomplete filter
 */
const expectUserListSortedAlphabetically = (filterString, excludeFilter = false) => {
    return cy.get('#multiSelectList').
        should('be.visible').
        children().
        each(($child) => {
            // To limit the amount of text fetched, only get the text content from the displayed name and username (without email)
            const currentChildText = $child.find('[id*="displayedUserName"]').text();
            const immediateNextSibling = $child.next();

            // * Expect all usernames displayed in the in user list to be sorted alphabetically
            if (immediateNextSibling.length) {
                const siblingText = immediateNextSibling.find('[id*="displayedUserName"]').text();
                const stringComparison = currentChildText.localeCompare(siblingText, 'en');

                // both strings equal -> 0, currentChildText comes before siblingText -> -1 (could vary by browser but should not be negative)
                expect(stringComparison, `${currentChildText} should be before ${siblingText}`).to.be.lte(0);
            }

            excludeFilter ?

                // * If a user is selected, ensure remaining users list does not contain the selected user
                expect(currentChildText).to.not.contain(filterString) :

                // * Optionally, ensure all usernames match the autocomplete input
                expect(currentChildText).to.contain(filterString);
        });
};

/**
 * Create a user and assign it to a team
 * @param {string} prefix Prefix to add to the username
 * @param {string} team Team object, reference to the team we want to add the user to
 */
const createTestUser = (prefix, team) => {
    cy.apiCreateUser({prefix}).then(({user}) =>
        cy.apiAddUserToTeam(team.id, user.id),
    );
};
