// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Image Link Preview', () => {
    let testTeam;

    before(() => {
        // # Enable Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;

            // # For test user, enable link previews and expand image previews
            cy.apiSaveLinkPreviewsPreference('true');

            cy.apiSaveCollapsePreviewsPreference('false');

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T331 Image link preview - Collapse and expand', () => {
        const link = 'http://www.traveller.com.au/content/dam/images/g/u/n/q/h/0/image.related.articleLeadwide.620x349.gunpvd.png/1488330286332.png';

        // # Post a link to an externally hosted image
        cy.postMessage(link);

        // # Click to reply to that post, and post that same link again (so you can see it twice in both center and RHS)
        cy.clickPostCommentIcon();

        cy.postMessageReplyInRHS(link);

        cy.getLastPostId().then((postId) => {
            // * Verify it renders correctly both on center and RHS view
            cy.get(`#post_${postId}`).should('be.visible').within(() => {
                cy.findByLabelText('Toggle Embed Visibility').
                    should('be.visible').and('have.attr', 'data-expanded', 'true');
                cy.findByLabelText('file thumbnail').should('be.visible');
            });

            cy.get(`#rhsPost_${postId}`).should('be.visible').within(() => {
                cy.findByLabelText('Toggle Embed Visibility').
                    should('be.visible').and('have.attr', 'data-expanded', 'true');
                cy.findByLabelText('file thumbnail').should('be.visible');
            });

            // # In center, click the collapse arrows to collapse the image preview
            cy.get(`#post_${postId}`).findByLabelText('Toggle Embed Visibility').
                click().
                should('have.attr', 'data-expanded', 'false');

            // * Observe it collapses in both center and RHS view
            cy.get(`#post_${postId}`).findByLabelText('file thumbnail').should('not.exist');

            cy.get(`#rhsPost_${postId}`).findByLabelText('file thumbnail').should('not.exist');

            // # In RHS, click the expand arrows to expand the image preview again
            cy.get(`#rhsPost_${postId}`).findByLabelText('Toggle Embed Visibility').
                click().
                should('have.attr', 'data-expanded', 'true');

            // * Observe it expand in center and RHS
            cy.get(`#post_${postId}`).findByLabelText('file thumbnail').should('be.visible');

            cy.get(`#rhsPost_${postId}`).findByLabelText('file thumbnail').should('be.visible');
        });

        // # In center message box, post slash command /collapse
        cy.postMessage('/collapse');

        // # Observe all image previews collapse
        cy.findByLabelText('file thumbnail').should('not.exist');

        // # In RHS reply box, post slash command /expand
        cy.postMessageReplyInRHS('/expand');

        // # All image previews expand back open
        cy.findAllByLabelText('file thumbnail').should('be.visible').and('have.length', 4);
    });

    it('MM-T1447 Images below a min-width and min-height are posted in a container that is clickable', () => {
        const IMAGE_BELOW_MIN_SIZE_1 = 'images-below-min-size-1.png';

        // # Upload Image with min dimensions as attachment and post it
        cy.get('#fileUploadInput').attachFile(IMAGE_BELOW_MIN_SIZE_1);
        cy.postMessage(`${Date.now()}-${IMAGE_BELOW_MIN_SIZE_1}`);

        // * Check that last post has image attachment and its dimensions are above 48px
        // and lastly verify that when its clicked, an image preview modal opens
        verifyLastAttachedImageHasMinSizeAndOpensPreviewInModal(IMAGE_BELOW_MIN_SIZE_1);

        const IMAGE_BELOW_MIN_SIZE_2 = 'images-below-min-size-2.png';

        // # Upload Image with min dimensions as attachment and post it
        cy.get('#fileUploadInput').attachFile(IMAGE_BELOW_MIN_SIZE_2);
        cy.postMessage(`${Date.now()}-${IMAGE_BELOW_MIN_SIZE_2}`);

        // * Check that last post has image attachment and its dimensions are above 48px
        // and lastly verify that when its clicked, an image preview modal opens
        verifyLastAttachedImageHasMinSizeAndOpensPreviewInModal(IMAGE_BELOW_MIN_SIZE_2);

        const IMAGE_BELOW_MIN_SIZE_3 = 'images-below-min-size-3.png';

        // # Upload Image with min dimensions as attachment and post it
        cy.get('#fileUploadInput').attachFile(IMAGE_BELOW_MIN_SIZE_3);
        cy.postMessage(`${Date.now()}-${IMAGE_BELOW_MIN_SIZE_3}`);

        // * Check that last post has image attachment and its dimensions are above 48px
        // and lastly verify that when its clicked, an image preview modal opens
        verifyLastAttachedImageHasMinSizeAndOpensPreviewInModal(IMAGE_BELOW_MIN_SIZE_3);

        const IMAGE_BELOW_MIN_SIZE_4 = 'images-below-min-size-4.png';

        // # Upload Image with min dimensions as attachment and post it
        cy.get('#fileUploadInput').attachFile(IMAGE_BELOW_MIN_SIZE_4);
        cy.postMessage(`${Date.now()}-${IMAGE_BELOW_MIN_SIZE_4}`);

        // * Check that last post has image attachment and its dimensions are above 48px
        // and lastly verify that when its clicked, an image preview modal opens
        verifyLastAttachedImageHasMinSizeAndOpensPreviewInModal(IMAGE_BELOW_MIN_SIZE_4);
    });
});

function verifyLastAttachedImageHasMinSizeAndOpensPreviewInModal(imageName) {
    // # Get the last uploaded image post
    cy.getLastPostId().then((lastPostId) => {
        // # Move inside the last post for finer control
        cy.get(`#${lastPostId}_message`).should('exist').and('be.visible').within(() => {
            // * Find the image attachment post, verify its dimensions and click on it to open preview modal
            cy.findByLabelText(`file thumbnail ${imageName}`).should('exist').and('be.visible').
                and((imageAttachment) => {
                    // * Check the dimensions of image's height is at atleast of 48px and greater
                    expect(imageAttachment.height()).to.be.greaterThan(48);

                    // * Check the dimensions of image's width is at atleast of 48px and greater
                    expect(imageAttachment.width()).to.be.greaterThan(48);
                }).
                click();
        });
    });

    // * Verify image preview modal is opened
    cy.get('.a11y__modal').should('exist').and('be.visible').
        within(() => {
            // * Verify we have the image inside the modal
            cy.findByTestId('imagePreview').should('exist').and('be.visible').
                and('have.attr', 'alt', 'preview url image');
        });

    // # Close the image preview modal
    cy.get('body').type('{esc}');
}
