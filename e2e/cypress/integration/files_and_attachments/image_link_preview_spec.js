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
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T331 Image link preview - Collapse and expand', () => {
        const link = 'http://www.traveller.com.au/content/dam/images/g/u/n/q/h/0/image.related.articleLeadwide.620x349.gunpvd.png/1488330286332.png';

        const expanded = 'button[data-expanded="true"]';
        const collapsed = 'button[data-expanded="false"]';

        // # Ensure Account Settings -> Display -> Default appearance of image previews is set to Expanded

        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        cy.get('.dropdown-menu').should('be.visible').findByText('Account Settings').click();

        cy.get('.settings-links').should('be.visible').findByText('Display').click();

        cy.get('#collapseDesc').within(() => {
            cy.get('span').contains('Expanded');
        });

        cy.get('#accountSettingsHeader > .close').click();

        // # Post a link to an externally hosted image
        cy.postMessage(link);

        // # Click to reply to that post, and post that same link again (so you can see it twice in both center and RHS)
        cy.clickPostCommentIcon();

        cy.postMessageReplyInRHS(link);

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.get(expanded).click().then(($element) => {
                    expect($element).to.have.attr('data-expanded', 'false');
                });
            });

            cy.get(`#rhsPost_${postId}`).within(() => {
                cy.get(collapsed).click().then(($element) => {
                    expect($element).to.have.attr('data-expanded', 'true');
                });
            });
        });

        // # In center message box, post slash command /collapse
        cy.postMessage('/collapse');

        // # Observe all image previews collapse
        cy.get(collapsed).should('exist');
        cy.get(expanded).should('not.exist');

        // # In RHS reply box, post slash command /expand
        cy.postMessageReplyInRHS('/expand');

        // # All image previews expand back open
        cy.get(expanded).should('exist');
        cy.get(collapsed).should('not.exist');
    });
});
