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
        cy.viewport(1300, 1000);

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
        cy.get('#fileUploadInput').attachFile('jpg-image-file.jpg');
        cy.get('#fileUploadInput').attachFile('gif-image-file.gif');
        cy.get('#fileUploadInput').attachFile('mp3-audio-file.mp3');
        cy.postMessage('This is the last post');

        getThumbnailPost().eq(0).invoke('height').as('initailThumbnailHeight');
        getAttachmentPost().eq(0).invoke('height').as('initialAttachmentHeight');
        getInlinImgPost().eq(0).invoke('height').as('initailInlineImgHeight');
        getFirstTextPost().eq(0).invoke('height').as('initail1stPostHeight');
        getLastTextPost().eq(0).invoke('height').as('initaillastPostHeight');

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
        cy.findAllByLabelText('sysadmin').eq(0).should('be.visible');
        cy.get('#post-list').should('exist').within(() => {
            cy.get('@initail1stPostHeight').then((originalHeight) => {
                getFirstTextPost().eq(0).should('exist').and('be.visible').should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initaillastPostHeight').then((originalHeight) => {
                getLastTextPost().eq(0).should('exist').and('be.visible').should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initailThumbnailHeight').then((originalHeight) => {
                getThumbnailPost().should('have.length', '3').and('be.visible').should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initailInlineImgHeight').then((originalHeight) => {
                getInlinImgPost().should('be.visible').and('have.css', 'height', (originalHeight + 2) + 'px');
            });
            cy.get('@initialAttachmentHeight').then((originalHeight) => {
                getAttachmentPost().should('be.visible').and('have.css', 'height', (originalHeight + 2) + 'px');
            });
        });

        // * Verify All posts are displayed correctly
        cy.findAllByTestId('postContent').should('have.class', 'post__content center').should('have.length', '5').each(($el) => {
            expect($el).to.be.visible;
        });
    });

    const getThumbnailPost = () => {
        return cy.get('.post-image__thumbnail');
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
