// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @accessibility

import * as TIMEOUTS from '../../../fixtures/timeouts';

function verifySearchAutocomplete(index, type = 'user') {
    cy.get('#search-autocomplete__popover').find('.search-autocomplete__item').eq(index).should('be.visible').and('have.class', 'selected a11y--focused').within((el) => {
        if (type === 'user') {
            cy.get('.mention--align').invoke('text').then((text) => {
                cy.get('.mention__fullname').invoke('text').then((fullName) => {
                    const position = text.length - fullName.length;
                    const usernameFullNameNickName = [text.slice(0, position), fullName].join(' ').replace('@', '').replace('(you)', '').replace('(', '').replace(')', '').toLowerCase();
                    cy.wrap(el).parents('#searchFormContainer').find('.sr-only').should('have.attr', 'aria-live', 'polite').and('have.text', usernameFullNameNickName);
                });
            });
        } else if (type === 'channel') {
            cy.get('.search-autocomplete__name').invoke('text').then((text) => {
                const channel = text.split('~')[1].toLowerCase().trim();
                cy.wrap(el).parents('#searchFormContainer').find('.sr-only').should('have.attr', 'aria-live', 'polite').and('have.text', channel);
            });
        }
    });
}

function verifyMessageAutocomplete(index, type = 'user') {
    cy.get('#suggestionList').find('.mentions__name').eq(index).should('be.visible').and('have.class', 'suggestion--selected').within((el) => {
        if (type === 'user') {
            cy.wrap(el).invoke('text').then((text) => {
                cy.get('.ml-2').invoke('text').then((fullName) => {
                    const position = text.length - fullName.length;
                    const usernameFullNameNickName = [text.slice(0, position), fullName].join(' ').replace('@', '').replace('(you)', '').replace('(', '').replace(')', '').toLowerCase();
                    cy.wrap(el).parents('.textarea-wrapper').find('.sr-only').should('have.attr', 'aria-live', 'polite').and('have.text', usernameFullNameNickName);
                });
            });
        } else if (type === 'channel') {
            cy.wrap(el).invoke('text').then((text) => {
                const channel = text.split('~')[0].toLowerCase().trim();
                cy.wrap(el).parents('.textarea-wrapper').find('.sr-only').should('have.attr', 'aria-live', 'polite').and('have.text', channel);
            });
        }
    });
}

describe('Verify Accessibility Support in different input fields', () => {
    let testTeam;
    let testChannel;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
    });

    beforeEach(() => {
        cy.apiCreateChannel(testTeam.id, 'accessibility', 'accessibility').then(({channel}) => {
            testChannel = channel;
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T1456 Verify Accessibility Support in Input fields in Invite People Flow', () => {
        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // # Click on Invite Members link
        cy.findByTestId('inviteMembersLink').should('be.visible').within(() => {
            cy.get('.arrow').click();
        });

        // * Verify Accessibility support in Share this link input field
        cy.findByTestId('shareLinkInput').should('have.attr', 'aria-label', 'team invite link');

        // * Verify Accessibility Support in Add or Invite People input field
        cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
            cy.get('input').should('have.attr', 'aria-label', 'Add or Invite People').and('have.attr', 'aria-autocomplete', 'list');
            cy.get('.users-emails-input__placeholder').should('have.text', 'Add members or email addresses');
        });

        cy.get('#backIcon').click();

        // # Click on Invite Guests link
        cy.findByTestId('inviteGuestLink').should('be.visible').within(() => {
            cy.get('.arrow').click();
        });

        // * Verify Accessibility Support in Invite People input field
        cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
            cy.get('input').as('inputEl').should('have.attr', 'aria-label', 'Invite People').and('have.attr', 'aria-autocomplete', 'list');
            cy.get('.users-emails-input__placeholder').should('have.text', 'Add guests or email addresses');
        });

        // * Verify Accessibility Support in Search and Add Channels input field
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            cy.get('input').should('have.attr', 'aria-label', 'Search and Add Channels').and('have.attr', 'aria-autocomplete', 'list');
            cy.get('.channels-input__placeholder').should('have.text', 'Search and add channels');
        });
    });

    it('MM-T1457 Verify Accessibility Support in Search Autocomplete', () => {
        // # Adding at least five other users in the channel
        for (let i = 0; i < 5; i++) {
            cy.apiCreateUser().then(({user}) => { // eslint-disable-line
                cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, user.id);
                });
            });
        }

        // * Verify Accessibility support in search input
        cy.get('#searchBox').should('have.attr', 'aria-describedby', 'searchbar-help-popup').and('have.attr', 'aria-label', 'Search').focus();
        cy.get('#searchbar-help-popup').should('be.visible').and('have.attr', 'role', 'tooltip');

        // # Ensure User list is cached once in UI
        cy.get('#searchBox').type('from:').wait(TIMEOUTS.FIVE_SEC);

        // # Trigger the user autocomplete again
        cy.get('#searchBox').clear().type('from:').wait(TIMEOUTS.FIVE_SEC).type('{downarrow}{downarrow}');

        // * Verify Accessibility Support in search autocomplete
        verifySearchAutocomplete(2);

        // # Press Down arrow twice and verify if focus changes
        cy.focused().type('{downarrow}{downarrow}');
        verifySearchAutocomplete(4);

        // # Press Up arrow and verify if focus changes
        cy.focused().type('{uparrow}');
        verifySearchAutocomplete(3);

        // # Type the in: filter and ensure channel list is cached once
        cy.get('#searchBox').clear().type('in:').wait(TIMEOUTS.FIVE_SEC);

        // # Trigger the channel autocomplete again
        cy.get('#searchBox').clear().type('in:').wait(TIMEOUTS.FIVE_SEC).type('{downarrow}{downarrow}');

        // * Verify Accessibility Support in search autocomplete
        verifySearchAutocomplete(2, 'channel');

        // # Press Up arrow and verify if focus changes
        cy.focused().type('{uparrow}{uparrow}');
        verifySearchAutocomplete(0, 'channel');
    });

    it('MM-T1455 Verify Accessibility Support in Message Autocomplete', () => {
        // # Adding at least one other user in the channel
        cy.apiCreateUser().then(({user}) => {
            cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                cy.apiAddUserToChannel(testChannel.id, user.id).then(() => {
                    // * Verify Accessibility support in post input field
                    cy.get('#post_textbox').should('have.attr', 'aria-label', `write to ${testChannel.display_name}`).clear().focus();

                    // # Ensure User list is cached once in UI
                    cy.get('#post_textbox').type('@').wait(TIMEOUTS.FIVE_SEC);

                    // # Select the first user in the list
                    cy.get('#suggestionList').find('.mentions__name').eq(0).within((el) => {
                        cy.get('.mention--align').invoke('text').then((text) => {
                            cy.wrap(el).parents('body').find('#post_textbox').clear().type(text);
                        });
                    });

                    // # Trigger the user autocomplete again
                    cy.get('#post_textbox').clear().type('@').wait(TIMEOUTS.FIVE_SEC).type('{uparrow}{uparrow}{downarrow}');

                    // * Verify Accessibility Support in message autocomplete
                    verifyMessageAutocomplete(1);

                    // # Press Up arrow and verify if focus changes
                    cy.focused().type('{downarrow}{uparrow}{uparrow}');

                    // * Verify Accessibility Support in message autocomplete
                    verifyMessageAutocomplete(0);

                    // # Trigger the channel autocomplete filter and ensure channel list is cached once
                    cy.get('#post_textbox').clear().type('~').wait(TIMEOUTS.FIVE_SEC);

                    // # Trigger the channel autocomplete again
                    cy.get('#post_textbox').clear().type('~').wait(TIMEOUTS.FIVE_SEC).type('{downarrow}{downarrow}');

                    // * Verify Accessibility Support in message autocomplete
                    verifyMessageAutocomplete(2, 'channel');

                    // # Press Up arrow and verify if focus changes
                    cy.focused().type('{downarrow}{uparrow}{uparrow}');

                    // * Verify Accessibility Support in message autocomplete
                    verifyMessageAutocomplete(1, 'channel');
                });
            });
        });
    });

    it('MM-T1458 Verify Accessibility Support in Main Post Input', () => {
        cy.get('#centerChannelFooter').within(() => {
            // * Verify Accessibility Support in Main Post input
            cy.get('#post_textbox').should('have.attr', 'aria-label', `write to ${testChannel.display_name}`).and('have.attr', 'role', 'textbox').clear().focus().type('test').tab({shift: true}).tab().tab();

            // * Verify if the focus is on the attachment icon
            cy.get('#fileUploadButton').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'attachment').tab();

            // * Verify if the focus is on the emoji picker
            cy.get('.emoji-picker__container').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'emoji picker').tab();
        });

        // * Verify if the focus is on the help link
        cy.get('#postCreateFooter .textbox-help-link').should('have.class', 'a11y--active a11y--focused');
    });

    it('MM-T1490 Verify Accessibility Support in RHS Input', () => {
        // # Wait till page is loaded
        cy.get('#post_textbox').should('be.visible').clear();

        // # Post a message and open RHS
        const message = `hello${Date.now()}`;
        cy.postMessage(message);
        cy.getLastPostId().then((postId) => {
            // # Mouseover the post and click post comment icon.
            cy.clickPostCommentIcon(postId);
        });

        cy.get('#rhsContainer').within(() => {
            // * Verify Accessibility Support in RHS input
            cy.get('#reply_textbox').should('have.attr', 'aria-label', 'add a comment...').and('have.attr', 'role', 'textbox').focus().type('test').tab({shift: true}).tab().tab();

            // * Verify if the focus is on the attachment icon
            cy.get('#fileUploadButton').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'attachment').tab();

            // * Verify if the focus is on the emoji picker
            cy.get('.emoji-picker__container').should('have.class', 'a11y--active a11y--focused').and('have.attr', 'aria-label', 'emoji picker').tab();

            // * Verify if the focus is on the help link
            cy.get('.textbox-help-link').should('have.class', 'a11y--active a11y--focused').tab();

            // * Verify if the focus is on the Add Comment button
            cy.get('#addCommentButton').should('have.class', 'a11y--active a11y--focused');
        });
    });
});
