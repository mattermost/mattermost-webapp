// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const timeouts = require('../../fixtures/timeouts');

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
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

        // Assigning alias to posted message ids
        cy.postMessage('This is the first post');
        cy.getLastPostId().as('firstPostId');
        cy.postMessage(link);
        cy.getLastPostId().as('linkPreviewId');
        cy.postMessage(gifLink);
        cy.getLastPostId().as('gifLinkPostId');

        // Posting different type of images and Videos
        const commonTypeFiles = ['jpg-image-file.jpg', 'gif-image-file.gif', 'mp3-audio-file.mp3', 'mpeg-video-file.mpg'];
        commonTypeFiles.forEach((file) => {
            cy.get('#fileUploadInput').attachFile(file);
            cy.postMessage(`Attached with ${file}`);
            cy.getLastPostId().as(`${file}PostId`);
        });
        cy.postMessage('This is the last post');
        cy.getLastPostId().as('lastPostId');

        // Getting height of all postes before applying 'Fixed width, centered' option and assigning alias
        getUserNameTitle().eq(0).invoke('height').as('initialUserNameHeight');
        getFirstTextPost().invoke('height').as('initialFirstPostHeight');
        getMp3Post().invoke('height').as('initialMp3Height');
        getMpgPost().invoke('height').as('initialMpgHeight');
        getGifPost().invoke('height').as('initialGifHeight');
        getJpgPost().invoke('height').as('initialJpgHeight');
        getAttachmentPost().invoke('height').as('initialAttachmentHeight');
        getInlineImgPost().invoke('height').as('initialInlineImgHeight');
        getLastTextPost().invoke('height').as('initialLastPostHeight');

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

        // * Verify All posts are displayed correctly
        cy.findAllByTestId('postContent').should('have.length', '9').and('have.class', 'post__content center');

        // * Verify there is no scroll pop
        cy.get('#post-list').should('exist').within(() => {
            cy.get('@initialUserNameHeight').then((originalHeight) => {
                getUserNameTitle().eq(0).should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialFirstPostHeight').then((originalHeight) => {
                getFirstTextPost().should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialLastPostHeight').then((originalHeight) => {
                getLastTextPost().should('exist').and('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialMp3Height').then((originalHeight) => {
                getMp3Post().should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialMpgHeight').then((originalHeight) => {
                getMpgPost().should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialGifHeight').then((originalHeight) => {
                getGifPost().should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialJpgHeight').then((originalHeight) => {
                getJpgPost().should('have.css', 'height', originalHeight + 'px');
            });
            cy.get('@initialInlineImgHeight').then((originalHeight) => {
                getInlineImgPost().should('have.css', 'height', (originalHeight + 2) + 'px');
            });
            cy.get('@initialAttachmentHeight').then((originalHeight) => {
                getAttachmentPost().should('have.css', 'height', (originalHeight + 2) + 'px');
            });
        });
    });

    // Finding elements and assigning to const variable for multiple use
    const getUserNameTitle = () => {
        return cy.findAllByLabelText('sysadmin');
    };

    // Getting element using mp3 Post Id, finding its child mp3 post and assigning to const variable for later use
    const getMp3Post = () => {
        return cy.get('@mp3-audio-file.mp3PostId').then((postId) => {
            cy.get(`#${postId}_message`).findByLabelText('file thumbnail mp3-audio-file.mp3');
        });
    };

    // Getting element using mpg Post Id, then finding its child mpg post and assigning to const variable for later use
    const getMpgPost = () => {
        return cy.get('@mpeg-video-file.mpgPostId').then((postId) => {
            cy.get(`#${postId}_message`).findByLabelText('file thumbnail mpeg-video-file.mpg');
        });
    };

    // Getting element using gif Post Id, then finding its child mpg post and assigning to const variable for later use
    const getGifPost = () => {
        return cy.get('@gif-image-file.gifPostId').then((postId) => {
            cy.get(`#${postId}_message`).findByLabelText('file thumbnail gif-image-file.gif');
        });
    };

    // Getting element using jpg Post Id, then finding its child jpg post and assigning to const variable for later use
    const getJpgPost = () => {
        return cy.get('@jpg-image-file.jpgPostId').then((postId) => {
            cy.get(`#${postId}_message`).findByLabelText('file thumbnail jpg-image-file.jpg');
        });
    };

    // Getting element using link preview Post Id, then finding its child file thumbnail post and assigning to const variable for later use
    const getAttachmentPost = () => {
        return cy.get('@linkPreviewId').then((postId) => {
            cy.get(`#${postId}_message`).find('img[aria-label="file thumbnail"]');
        });
    };

    // Getting element using gif Link Post Id, then finding its child file thumbnail post and assigning to const variable for later use
    const getInlineImgPost = () => {
        return cy.get('@gifLinkPostId').then((postId) => {
            cy.get(`#${postId}_message`).find('img[aria-label="file thumbnail"]');
        });
    };

    // Getting element using first Post Id, then finding its child text and assigning to const variable for later use
    const getFirstTextPost = () => {
        return cy.get('@firstPostId').then((postId) => {
            cy.get(`#${postId}_message`).findByText('This is the first post');
        });
    };

    // Getting element using last Post Id, then finding its child text and assigning to const variable for later use
    const getLastTextPost = () => {
        return cy.get('@lastPostId').then((postId) => {
            cy.get(`#${postId}_message`).findByText('This is the last post');
        });
    };
});
