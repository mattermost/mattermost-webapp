// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @file_and_attachments

describe('Upload Files', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T336 Image thumbnail - expanded RHS', () => {
        const filename = 'huge-image.jpg';
        const originalWidth = 1920;
        const originalHeight = 1280;
        const aspectRatio = originalWidth / originalHeight;

        // # Post an image in center channel
        cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile(filename);
        cy.get('.post-image').should('be.visible');
        cy.postMessage('{enter}');

        // # Click reply arrow to open the reply thread in RHS
        cy.clickPostCommentIcon();

        cy.get('#rhsContainer').within(() => {
            // # Observe image thumbnail displays the same
            cy.get('img[src*="/preview"]').should('be.visible').and((img) => {
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
            });

            // # In the RHS, click the expand arrows to expand the RHS
            cy.findByLabelText('Expand').click();
        });

        cy.get('.sidebar--right--expanded').should('be.visible').within(() => {
            // * Observe image thumnail displays the same
            cy.get('img[src*="/preview"]').should('be.visible').and((img) => {
                expect(img.width() / img.height()).to.be.closeTo(aspectRatio, 0.01);
            });
        });
    });

    it('MM-T337 CTRL/CMD+U - Five files on one message, thumbnails while uploading', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);
        const filename = 'huge-image.jpg';
        cy.get('#centerChannelFooter').find('#fileUploadInput').
            attachFile(filename).
            attachFile(filename).
            attachFile(filename).
            attachFile(filename).
            attachFile(filename);
        for (let i = 1; i < 5; i++) {
            cy.get(`:nth-child(${i}) > .post-image__thumbnail > .post-image`).should('be.visible');
        }
        cy.get(':nth-child(5) > .post-image__thumbnail > .post-image').should('not.be.visible');
        cy.get('.file-preview__container').scrollTo('right');
        for (let i = 1; i < 3; i++) {
            cy.get(`:nth-child(${i}) > .post-image__thumbnail > .post-image`).should('not.be.visible');
        }
        cy.get(':nth-child(5) > .post-image__thumbnail > .post-image').should('be.visible');
        cy.postMessage('{enter}');
        cy.findByTestId('fileAttachmentList').find('.post-image').should('have.length', 5);
    });
});
