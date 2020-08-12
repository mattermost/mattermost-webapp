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
});
