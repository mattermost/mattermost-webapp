// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

describe('Settings > Display > Message Display: Colorize username', () => {
    let testTeam;
    let firstUser;
    let otherUser;
    let testChannel;
    const colors = {};

    before(() => {

        // # Login as new user and visit off-topic
        cy.apiInitSetup().then(({channel, user, team}) => {
            testTeam = team;
            firstUser = user;
            testChannel = channel;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                // # Add user to team and channel
                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);

                    cy.visit(`/${team.name}/channels/${testChannel.name}`);

                    // # Post some messages
                    cy.postMessageAs({
                        sender: otherUser,
                        message: 'Other message',
                        channelId: testChannel.id,
                    });
                    cy.postMessageAs({
                        sender: firstUser,
                        message: 'Test message',
                        channelId: testChannel.id,
                    });
                });
            });
            goToMessageDisplaySetting();
        },
        );
    });

    // it('MM-T4984_1 Message Display: colorize usernames option should not exist in Compact mode', () => {
    //     // * Verify 'Standard' is selected
    //     cy.findByRole('heading', {name: 'Message Display'}).click();
    //     cy.findByRole('radio', {
    //         name: 'Standard: Easy to scan and read.',
    //     }).click();

    //     // * Verify Colorize usernames option doesn't exist;
    //     cy.findByRole('checkbox', {
    //         name: 'Colorize usernames: Use colors to distinguish users in compact mode',
    //     }).should('not.exist');

    //     // # Save and close the modal
    //     cy.uiSave();
    //     cy.uiClose();
    // });
    it('MM-T4984_2 Message Display: colorize usernames option should exist in Compact mode', () => {
        // * Verify 'Standard' is selected
        cy.findByRole('heading', {name: 'Message Display'}).click();
        cy.findByRole('radio', {
            name: 'Compact: Fit as many messages on the screen as we can.',
        }).click();

        // * Verify Colorize usernames option exists;
        cy.findByRole('checkbox', {
            name: 'Colorize usernames: Use colors to distinguish users in compact mode',
        }).should('exist');

        // # Save and close the modal
        cy.uiSave();
        cy.uiClose();

        cy.findByText(firstUser.username).then((elements) => {
            colors[firstUser.username] = elements[0].attributes.style.value;
            console.log('------------------------------');
            console.log(elements);
            console.log(elements[0].attributes.style.value);
            console.log('------------------------------');

            // elements.each((index, element) => {
            //     if (index === 0) {
            //         // todo skip the first element
            //     } else {
            //         cy.wrap(element).should('have.attr', 'style', 'color: rgb(255, 0, 0)');

            //         // cy.wrap(element).should('have.css', 'color', 'rgb(63, 67, 80)');  // todo check if there is a variable for defaul color
            //     }
            // });
        });
        cy.findByText(otherUser.username).then((elements) => {
            colors[otherUser.username] = elements[0].attributes.style.value;
            console.log(colors);
            console.log("------------------------------");
            console.log(elements);
            console.log(elements[0].attributes.style.value);
            console.log("------------------------------");
        }).then(() => {
            console.log(colors);
            expect(colors[firstUser.username]).to.not.equal(colors[otherUser.username]);
        });

        cy.reload();
    });
});

function goToMessageDisplaySetting() {
    // # Go to Settings modal - Display section - Message Display
    cy.uiOpenSettingsModal('Display').within(() => {
        cy.get('#displayButton').click();
        cy.get('#message_displayEdit').should('be.visible');
        cy.get('#message_displayEdit').click();
    });
}

// # Open Settings > Display > Themes
// cy.uiOpenSettingsModal('Display').within(() => {
//     cy.get('#displayButton').click();
//     cy.get('#displaySettingsTitle').should('exist');
//     cy.get('#themeTitle').scrollIntoView().should('be.visible');
//     cy.get('#themeEdit').click();

//     // * Verify image alt in Theme Images
//     cy.get('#displaySettings').within(() => {
//         cy.get('.appearance-section>div').children().each(($el) => {
//             cy.wrap($el).get('#denim-theme-icon').should('have.text', 'Denim theme icon');
//         });
//     });
// });
