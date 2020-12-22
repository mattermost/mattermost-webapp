// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Account Settings > Sidebar > General', () => {
    let testUser;
    let testTeam;

    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('Nickname should render in before clicking edit', () => {
        cy.toAccountSettingsModal();

        // # Check that the General tab is loaded and click it
        cy.get('#generalButton').should('be.visible').click();

        // * Check if element is present before nickname is set and contains expected text values
        cy.get('#generalSettingsTitle').should('be.visible').should('contain', 'General Settings');
        cy.get('#nicknameTitle').should('be.visible').should('contain', 'Nickname');
        cy.get('#nicknameDesc').should('be.visible').should('contain', testUser.nickname);
        cy.get('#nicknameEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    it('Nickname should render after clicking edit', () => {
        cy.toAccountSettingsModal();

        // # Click "Edit" to the right of "Nickname"
        cy.get('#nicknameEdit').should('be.visible').click();

        // * Check elements after clicking 'Edit'
        cy.get('#generalSettingsTitle').should('be.visible').should('contain', 'General Settings');
        cy.get('#settingTitle').should('be.visible').should('contain', 'Nickname');
        cy.get('#nickname').should('be.visible');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    it('No nickname is present', () => {
        cy.toAccountSettingsModal();

        // # Click "Edit" to the right of "Nickname"
        cy.get('#nicknameEdit').should('be.visible').click();

        // # Clear the nickname text field contents
        cy.get('#nickname').clear();
        cy.get('#saveSetting').click();

        cy.get('#nicknameDesc').should('be.visible').should('contain', "Click 'Edit' to add a nickname");

        // # Close Account settings and open channel dropdown menu
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click view members
        cy.get('#viewMembers').should('be.visible').click();

        // # Search for username and check that no nickname is present
        cy.get('.modal-title').should('be.visible');
        cy.get('#searchUsersInput').should('be.visible').type(testUser.first_name);
        cy.get('.more-modal__details > .more-modal__name').should('be.visible').then((el) => {
            expect(getInnerText(el)).equal(`@${testUser.username} - ${testUser.first_name} ${testUser.last_name}`);
        });

        // # Close Team Members modal
        cy.get('#teamMembersModal').should('be.visible').within(() => cy.get('.close').click());
    });

    it('MM-T268 Account Settings > Add Nickname', () => {
        cy.toAccountSettingsModal();

        // # Click the General tab
        cy.get('#generalButton').should('be.visible').click();

        // # Add the nickname to textfield contents
        cy.get('#nicknameEdit').click();
        cy.get('#nickname').clear().type('victor_nick');
        cy.get('#saveSetting').click();

        // * Check if element is present and contains expected text values
        cy.get('#nicknameDesc').should('be.visible').should('contain', 'victor_nick');

        // # Close Account settings and open channel dropdown menu
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click view members
        cy.get('#viewMembers').should('be.visible').click();

        // # Search for username and check that expected nickname is present
        cy.get('.modal-title').should('be.visible');
        cy.get('#searchUsersInput').should('be.visible').type(testUser.first_name);
        cy.get('.more-modal__details > .more-modal__name').should('be.visible').then((el) => {
            expect(getInnerText(el)).equal(`@${testUser.username} - ${testUser.first_name} ${testUser.last_name} (victor_nick)`);
        });

        // # Close Channel Members modal
        cy.get('#teamMembersModal').should('be.visible').within(() => cy.get('.close').click());
    });

    it('MM-T2060 Nickname and username styles', () => {
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Channel').then(({channel}) => {
            // # Go to test channel
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // # Click 'Add Members'
            cy.get('#channelHeaderTitle').click();
            cy.get('#channelAddMembers').click();

            // * Verify that the username span contains the '@' symbol and the dark colour
            cy.get('#multiSelectList > div > .more-modal__details > .more-modal__name > span').should('contain', '@').and('have.css', 'color', 'rgb(61, 60, 64)');

            // # Close modal
            cy.get('body').type('{esc}');

            // # Go to manage members modal
            cy.get('#channelMemberIcon').click();
            cy.get('#member-list-popover').should('be.visible').within(() => {
                cy.findByTestId('membersModal').click();
            });

            // * Verify that the username span contains the '@' symbol and the dark colour
            cy.get('.more-modal__details > .more-modal__name').should('contain', '@').and('have.css', 'color', 'rgb(61, 60, 64)');

            // # Close modal
            cy.get('body').type('{esc}');

            // # Click More... in the sidebar
            cy.get('#moreDirectMessage').scrollIntoView().should('be.visible').click();

            // # Go to direct messages modal
            cy.get('.more-modal').should('be.visible').within(() => {
                cy.findByText('Direct Messages').click();
                cy.get('#selectItems').click().type('@');

                // * Verify that the username span contains the '@' symbol and the dark colour
                cy.get('.more-modal__details > .more-modal__name').should('contain', '@').and('have.css', 'color', 'rgb(61, 60, 64)');
            });

            // # Exit the modal
            cy.get('body').type('{esc}');
        });
    });

    it('MM-T2061 Nickname should reset on cancel of edit', () => {
        cy.toAccountSettingsModal();

        cy.get('#generalButton').should('be.visible').click();

        // # Add the nickname to textfield contents
        cy.get('#nicknameEdit').click();
        cy.get('#nickname').clear().type('nickname_edit');

        // # Cancel the edit of nickname
        cy.get('#cancelSetting').click();

        // # Click edit of nickname
        cy.get('#nicknameEdit').click();

        // * Check if element is present and contains old nickname
        cy.get('#nickname').should('be.visible').should('contain', '');

        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    it('MM-T2062 Clear nickname and save', () => {
        cy.toAccountSettingsModal();

        // # Go to general settings > Edit nickname
        cy.get('#generalButton').should('be.visible').click();
        cy.get('#nicknameEdit').click();

        // # Clear the nickname
        cy.get('#nickname').clear();

        // * Check if nickname element is present and it does not contain any nickname
        cy.get('#nickname').should('be.visible').should('contain', '');
        cy.get('#saveSetting').click();

        // * Verify nickname help text is visible
        cy.get('#nicknameDesc').should('be.visible').should('contain', "Click 'Edit' to add a nickname");

        // # Close the modal
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    function getInnerText(el) {
        return el[0].innerText.replace(/\n/g, '').replace(/\s/g, ' ');
    }
});
