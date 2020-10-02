// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @emoji

import * as TIMEOUTS from '../../fixtures/timeouts';

function deleteCustomEmoji(testTeam) {
    cy.visit(`/${testTeam.name}/channels/town-square`);

    // # Delete the custom emoji
    // * Open sidebar
    cy.get('#sidebarHeaderDropdownButton').click();

    // * Click on custom emojis
    cy.get('#customEmojis').should('be.visible').click();

    // * Select delete custom emoji
    cy.get('.emoji-list-item_actions').within(() => {
        // # Click on Delete
        cy.findByText('Delete').should('exist').and('be.visible').click();
    }).then(() => {
        cy.get('#confirmModalButton').should('be.visible').click();
    });
}

describe('Custom emojis', () => {
    let testTeam;
    let testUser;
    let otherUser;

    const builtinEmojiWithColons = ':taco:';
    const builtinEmojiUppercaseWithColons = ':TAco:';
    const builtinEmojiWithoutColons = 'taco';
    const customEmojiWithoutColons = 'emoji';
    const customEmojiWithColons = ':emoji:';
    const builtinEmojiImageUrl = `${Cypress.config('baseUrl')}/static/emoji/1f32e.png`;
    const largeEmojiFile = 'gif-image-file.gif';
    const animatedGifEmojiFile = 'animated-gif-image-file.gif';
    const tooLargeEmojiFile = 'huge-image.jpg';

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableCustomEmoji: true,
            },
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });

        cy.apiCreateUser().then(({user: user1}) => {
            otherUser = user1;
            cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        }).then(() => {
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-9777 User cant add custom emoji with the same name as a system one', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name and click on save
        cy.get('#name').type('croissant');
        cy.get('.backstage-form__footer').within(($form) => {
            cy.wrap($form).find('.btn-primary').click();

            // # Check for error saying that the emoji icon is a system one
            cy.wrap($form).find('.has-error').should('be.visible').and('have.text', 'This name is already in use by a system emoji. Please choose another name.');
        });
    });

    it('MM-T2180 Custom emoji - cancel out of add', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithoutColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile('mattermost-icon.png');

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Cancel
            cy.wrap($form).find('.btn-link').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // # Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithoutColons);

        // # Validate that we cannot find the emoji name in the search result list
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + customEmojiWithoutColons + '"');
    });

    it('MM-T2181 Custom emoji - add large', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Check that the emoji image appears in the emoji list
        // * Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // * Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

        // # Post a message with the emoji
        cy.get('#post_textbox').clear().type(customEmojiWithColons.substring(0, 4));

        // * Suggestion list should appear
        cy.get('#suggestionList').should('be.visible');

        // * Emoji name should appear in the list
        cy.findByText(customEmojiWithColons).should('be.visible');

        // # Hit enter to select from suiggestion list
        cy.get('#post_textbox').type('{enter}');

        // # Hit enter to post
        cy.get('#post_textbox').type('{enter}');

        // # Check that the emoji image appears in the message - extract the image url and compafe with local image
        cy.getLastPost().find('p').find('span > span').then((imageSpan) => {
            cy.expect(imageSpan.attr('title')).to.equal(customEmojiWithColons);

            // # Filter out the url from the css background property
            // url("https://imageurl") => https://imageurl
            const url = imageSpan.css('background-image').split('"')[1];

            // # Verify that the emoji image i sthe correct one
            cy.fixture(largeEmojiFile).then((overrideImage) => {
                cy.request({url, encoding: 'base64'}).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });

        // # Reload the page
        cy.reload();

        // # Check that the emoji image appears in the message - extract the image url and compafe with local image
        cy.getLastPost().find('p').find('span > span').then((imageSpan) => {
            cy.expect(imageSpan.attr('title')).to.equal(customEmojiWithColons);

            // # Filter out the url from the css background property
            // url("https://imageurl") => https://imageurl
            const url = imageSpan.css('background-image').split('"')[1];

            // # Verify that the emoji image i sthe correct one
            cy.fixture(largeEmojiFile).then((overrideImage) => {
                cy.request({url, encoding: 'base64'}).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2182 Custom emoji - animated gif', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(animatedGifEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);
        cy.wait(TIMEOUTS.HALF_SEC); // eslint-disable-line cypress/no-unnecessary-waiting

        // # Check that the emoji image appears in the emoji list
        // * Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // * Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2183 Custom emoji - try to add too large', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(tooLargeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();

            // # Check for error
            cy.wrap($form).find('.has-error').should('be.visible').and('have.text', 'Unable to create emoji. Image must be smaller than 1028 by 1028.');
        });
    });

    it('MM-T2184 Custom emoji - filter list', () => {
        const emojiNameForSearch1 = 'alabala';
        const emojiNameForSearch2 = customEmojiWithColons;

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Search for a missing emoji
        // * Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // * Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(emojiNameForSearch1);

        // #Get list of emojis based on search text
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + emojiNameForSearch1 + '"');

        // # Search for an existing emoji
        // * Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').clear().type(emojiNameForSearch2);

        // #Get list of emojis based on search text
        cy.findAllByTestId('emojiItem').children().should('have.length', 1);
        cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2185 Custom emoji - renders immediately for other user Custom emoji - renders after logging out and back in', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);

        // # User2 logs in
        cy.apiLogin(otherUser);

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # The emoji should be displayed in the post
        // * Get the emoji image span
        cy.getLastPost().find('p').find('span > span').then((imageSpan) => {
            cy.expect(imageSpan.attr('title')).to.equal(customEmojiWithColons);

            // # Filter out the url from the css background property
            // url("https://imageurl") => https://imageurl
            const url = imageSpan.css('background-image').split('"')[1];

            // # Verify that the emoji image i sthe correct one
            cy.fixture(largeEmojiFile).then((overrideImage) => {
                cy.request({url, encoding: 'base64'}).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });

        // # User1 logs in
        cy.apiLogin(testUser);

        // # The emoji should be displayed in the post
        // * Get the emoji image span
        cy.getLastPost().find('p').find('span > span').then((imageSpan) => {
            cy.expect(imageSpan.attr('title')).to.equal(customEmojiWithColons);

            // # Filter out the url from the css background property
            // url("https://imageurl") => https://imageurl
            const url = imageSpan.css('background-image').split('"')[1];

            // # Verify that the emoji image i sthe correct one
            cy.fixture(largeEmojiFile).then((overrideImage) => {
                cy.request({url, encoding: 'base64'}).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2186 Emoji picker - default and custom emoji reaction, case-insensitive', () => {
        const messageText = 'test message';

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message
        cy.postMessage(messageText);

        // # Edit post and add a message
        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', messageText);

            // # Press the up arrow to open the edit modal
            cy.get('#post_textbox').type('{uparrow}');

            // # Search for the pre-built emoji
            // * Show emoji list
            cy.get('#editPostEmoji').should('be.visible').click();

            // * Search emoji name text in emoji searching input
            cy.findByTestId('emojiInputSearch').should('be.visible').type(builtinEmojiUppercaseWithColons);

            // # Get list of emojis based on the search text
            cy.findAllByTestId('emojiItem').children().should('have.length', 1);
            cy.findAllByTestId('emojiItem').children().click();

            // # Search for the custom emoji
            // * Show emoji list
            cy.get('#editPostEmoji').should('be.visible').click();

            // * Search first three letters of the emoji name text in emoji searching input
            cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithoutColons.substring(0, 4));

            // # Get list of emojis based on the search text
            cy.findAllByTestId('emojiItem').children().should('have.length', 1);
            cy.findAllByTestId('emojiItem').children('img').first().should('have.class', 'emoji-category--custom');

            cy.findAllByTestId('emojiItem').children().click();

            // * Complete the edit post action
            cy.get('#editButton').click();
        });

        // # Verify that the builtin emoji is present in the post
        cy.getLastPost().find('p').should('contain.html', messageText + ' <span data-emoticon="' + builtinEmojiWithoutColons + '"><span alt="' + builtinEmojiWithColons + '" class="emoticon" title="' + builtinEmojiWithColons + '" style="background-image: url(&quot;' + builtinEmojiImageUrl + '&quot;);">' + builtinEmojiWithColons + '</span>');

        // # Verify that the custom emoji is present in the post
        cy.getLastPost().find('p').should('contain.html', '<span data-emoticon="' + customEmojiWithoutColons + '">');

        cy.reload();

        // # Verify that the builtin emoji is present in the post
        cy.getLastPost().find('p').should('contain.html', messageText + ' <span data-emoticon="' + builtinEmojiWithoutColons + '"><span alt="' + builtinEmojiWithColons + '" class="emoticon" title="' + builtinEmojiWithColons + '" style="background-image: url(&quot;' + builtinEmojiImageUrl + '&quot;);">' + builtinEmojiWithColons + '</span>');

        // # Verify that the custom emoji is present in the post
        cy.getLastPost().find('p').should('contain.html', '<span data-emoticon="' + customEmojiWithoutColons + '">');

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2187 Custom emoji reaction', () => {
        const messageText = 'test message';

        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message
        cy.postMessage(messageText);

        // # Edit post and add a message
        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', messageText);

            // # Edit the last post
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear, and edit the post
            cy.get('#editPostModal').should('be.visible');
            cy.get('#edit_textbox').should('have.text', messageText).type(' ' + customEmojiWithColons);
            cy.get('#editButton').click();
        });

        deleteCustomEmoji(testTeam);
    });

    it('MM-T2188 Custom emoji - delete emoji after using in post and reaction', () => {
        // # Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type emoji name
        cy.get('#name').type(customEmojiWithColons);

        // # Select emoji image
        cy.get('input#select-emoji').attachFile(largeEmojiFile);

        cy.get('.backstage-form__footer').within(($form) => {
            // # Click on Save
            cy.wrap($form).find('.btn-primary').click();
        });

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Post a message with the emoji
        cy.postMessage(customEmojiWithColons);

        // # Delete the emoji
        // * Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // * Select delete new emoji
        cy.get('.emoji-list-item_actions').within(() => {
            // # Click on Delete
            cy.findByText('Delete').should('exist').and('be.visible').click();
        }).then(() => {
            cy.get('#confirmModalButton').should('be.visible').click();
        });

        cy.reload();

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Search for the deleted emoji
        // * Show emoji list
        cy.get('#emojiPickerButton').should('be.visible').click();

        // * Search emoji name text in emoji searching input
        cy.findByTestId('emojiInputSearch').should('be.visible').type(customEmojiWithColons);

        // * Get list of emojis based on search text
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + customEmojiWithoutColons + '"');

        // # Navigate to a channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Verify that only the message renders in the post and the emoji has been deleted
        cy.getLastPost().find('p').should('have.html', '<span data-emoticon="' + customEmojiWithoutColons + '">' + customEmojiWithColons + '</span>');
    });
});

