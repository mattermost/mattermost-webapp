// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const timeouts = require('../../fixtures/timeouts');

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @scroll

describe('Scroll', () => {
    let testTeam;
    let testChannel;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });
    });

    it('MM-T2368 Fixed width', () => {
        const link = 'https://www.bbc.com/news/uk-wales-45142614';
        const gifLink = '![gif](http://i.giphy.com/xNrM4cGJ8u3ao.gif)';
        cy.postMessage('This is the first post');
        cy.postMessage(link);
        cy.postMessage(gifLink);

        const commonTypeFiles = ['jpg-image-file.jpg', 'gif-image-file.gif', 'mp3-audio-file.mp3', 'mpeg-video-file.mpg'];
        commonTypeFiles.forEach((file) => {
            cy.get('#fileUploadInput').attachFile(file);
            cy.postMessage(`Attached with ${file}`);
        });
        cy.postMessage('This is the last post');
        getUserNameTitle().eq(0).invoke('height').as('initialUserNameHeight');
        getThumbnailPost().eq(0).invoke('height').as('initialThumbnailHeight');
        getAttachmentPost().eq(0).invoke('height').as('initialAttachmentHeight');
        getInlinImgPost().eq(0).invoke('height').as('initialInlineImgHeight');
        getFirstTextPost().eq(0).invoke('height').as('initial1stPostHeight');
        getLastTextPost().eq(0).invoke('height').as('initiallastPostHeight');
        getGifPost().eq(0).invoke('height').as('initialGifPostHeight');
        getJpgPost().eq(0).invoke('height').as('initialJpgPostHeight');

        // # Switch the account settings for the test user to enable Fixed width center
        cy.toAccountSettingsModal();
        cy.get('#accountSettingsModal').should('be.visible').within(() => {
            cy.findByText('Display', {timeout: timeouts.ONE_MIN}).click();
            cy.findByText('Channel Display').click();
            cy.findByLabelText('Fixed width, centered').click();
            cy.findByText('Save').click();
            cy.get('#accountSettingsHeader > .close').click();
        });

        // # Browse to Channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // * Verify there is no scroll pop
        cy.get('#post-list').should('exist').within(() => {
            cy.get('@initialUserNameHeight').then((originalHeight) => {
                getUserNameTitle().eq(0).should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initial1stPostHeight').then((originalHeight) => {
                getFirstTextPost().eq(0).should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initiallastPostHeight').then((originalHeight) => {
                getLastTextPost().eq(0).should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialThumbnailHeight').then((originalHeight) => {
                getThumbnailPost().should('have.length', '2').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialInlineImgHeight').then((originalHeight) => {
                getInlinImgPost().should('have.css', 'height', (originalHeight + 2) + 'px');
            });
            cy.get('@initialAttachmentHeight').then((originalHeight) => {
                getAttachmentPost().should('have.css', 'height', (originalHeight + 2) + 'px');
            });

            cy.get('@initialGifPostHeight').then((originalHeight) => {
                getGifPost().should('have.css', 'height', originalHeight + 'px');
            });

            cy.get('@initialJpgPostHeight').then((originalHeight) => {
                getJpgPost().should('have.css', 'height', originalHeight + 'px');
            });
        });

        // * Verify All posts are displayed correctly
        cy.findAllByTestId('postContent').should('have.length', '9').and('have.class', 'post__content center');
    });

    const getUserNameTitle = () => {
        return cy.findAllByLabelText('sysadmin');
    };
    const getThumbnailPost = () => {
        return cy.get('.post-image__thumbnail');
    };

    const getGifPost = () => {
        return cy.findAllByLabelText('file thumbnail gif-image-file.gif');
    };

    const getJpgPost = () => {
        return cy.findAllByLabelText('file thumbnail jpg-image-file.jpg');
    };

    const getAttachmentPost = () => {
        return cy.get('.attachment__image');
    };

    const getInlinImgPost = () => {
        return cy.get('.markdown-inline-img');
    };

    const getFirstTextPost = () => {
        return cy.findByText('This is the first post');
    };

    const getLastTextPost = () => {
        return cy.findByText('This is the last post');
    };
});
