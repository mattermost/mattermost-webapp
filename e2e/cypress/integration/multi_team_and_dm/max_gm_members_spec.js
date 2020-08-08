
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const createUserAndAddToTeam = (team) => {
    cy.log(`CREATE USER AND ADD TO TEAM ${JSON.stringify(team, null, 2)}`);
    cy.apiCreateUser().then(({user}) =>
        cy.apiAddUserToTeam(team.id, user.id),
    );
};

const addUsersToGMViaModal = (userCountToAdd) => {
    // Ensure there are enough selectable users in the list
    cy.get('#multiSelectList').
        should('be.visible').
        children().
        should('have.length.gte', userCountToAdd);

    // Add users 1 by 1 and ensure the help section's text updates accordingly
    Cypress._.times(userCountToAdd, () => {
        cy.get('#multiSelectList').
            children().
            first().
            click();
    });
};

describe('Multi-user group messages', () => {
    /**
 * MM-T463 GM: Maximum users
Steps
GM: Maximum users
--------------------
1. Add 7 users to the same GM (but don't Save yet) - DONE
2. Non-RN: Verify says "You can add 0 more people" and also "You've reached the maximum number of people for this conversation. Consider creating a private channel instead."
3. Try to click another user from the list or use arrows to highlight a user and press Enter
4. Verify additional user is not added to the list at the top
5. Save / Start to open GM channel
6. Click channel name > Add Members (still says you can add zero members)
7. Backspace or click "x" next to a username to remove it from the GM
Expected
After last step, message says "You can add 1 more person."
Also says "This will start a new conversation. If you‚Äôre adding a lot of people, consider creating a private channel instead."

Desktop Only:
Ensure that "Write to..." text in main imput box is truncated and does not wrap if all of the names are too long

(Can then add another user and Save to open the GM)
 */
    let testTeam;
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // Add 10 users to the team
            Cypress._.times(10, createUserAndAddToTeam(testTeam));
        });
    });

    it('MM-T463 Should not be able to create a group message with more than 8 users', () => {
        const maxUsersGMNote = "You've reached the maximum number of people for this conversation. Consider creating a private channel instead.";

        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#addDirectChannel').click();

        // Add the maximum amount of users to a group message (7)
        addUsersToGMViaModal(7);

        // Check that the user count in the group message modal equals 7
        cy.get('.react-select__multi-value').should('have.length', 7);

        // Check that the help section indicates we cannot add anymore users
        cy.get('#multiSelectHelpMemberInfo').
            should('be.visible').
            and('contain.text', 'You can add 0 more people');

        // Check that a note in the help section suggests creating a private channel instead
        cy.get('#multiSelectMessageNote').should('contain.text', maxUsersGMNote);

        // Try to add one more user
        addUsersToGMViaModal(1);

        // Check that the list of users in the multi-select is still 7
        cy.get('.react-select__multi-value').should('have.length', 7);

        // Begin the group message
        cy.get('#saveItems').click();

        // Check that the number of users in the group message is 8
        cy.get('#channelMemberCountText').
            should('be.visible').
            and('have.text', '8');

        // From the group message menu, open the 'Add Members' dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelAddMembers').click();

        // Try to add one more user
        addUsersToGMViaModal(1);

        // Check that the same error message is still displayed, forbidding adding any more users
        cy.get('#multiSelectHelpMemberInfo').
            should('be.visible').
            and('contain.text', 'You can add 0 more people');

        // Check that a note in the help section suggests creating a private channel instead
        cy.get('#multiSelectMessageNote').should('contain.text', maxUsersGMNote);

        // Check that the list of users in the multi-select is still 7
        cy.get('.react-select__multi-value').should('have.length', 7);

        // Close the modal
        cy.get('#moreDmModal ').type('{esc}');

        // Check that the number of users in the group message is still 8
        cy.get('#channelMemberCountText').
            should('be.visible').
            and('have.text', '8');

        // // Remove the last user from the GM
        // cy.get('.react-select__multi-value__remove').last().click();
        // cy.get('.react-select__multi-value__remove').should('have.length', 7);

        // // Check that the number of users in the group message is now 7
        // cy.get('#channelMemberCountText').
        //     should('be.visible').
        //     and('have.text', '7');

        // // From the group message menu, open the 'Add Members' dialog
        // cy.get('#channelHeaderDropdownIcon').click();
        // cy.get('#channelAddMembers').click();

        // // Modal help section should say that we can add one more user
        // cy.get('#multiSelectHelpMemberInfo').
        //     should('be.visible').
        //     and('contain.text', 'You can add 1 more person');
    });
});