// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    const maxReplyCount = 15;
    const replyTextBoxId = 'reply_textbox';

    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Post a new message to ensure there will be a post to click on
            cy.postMessage('Hello ' + Date.now());
        });

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // # Post several replies and verify last reply
        for (let i = 1; i <= maxReplyCount; i++) {
            cy.postMessageReplyInRHS(`post ${i}`);
        }
    });

    it('MM-T209 Input box on reply thread can expand', () => {
        const halfViewportHeight = Cypress.config('viewportHeight') / 2;
        const padding = 10;
        const postCreateContainerDefaultHeight = 190;
        const replyTextBoxDefaultHeight = 100;
        const postCreateContainerClassName = 'post-create__container';
        let newLinesCount;

        cy.get(`#${replyTextBoxId}`).clear().should('be.visible').as('replyTextBox');
        verifyLastReply();

        // # Get post create container and reply text box
        cy.document().then((doc) => {
            const postCreateContainer = doc.getElementsByClassName(postCreateContainerClassName)[0];
            const replyTextBox = doc.getElementById(replyTextBoxId);

            // * Check if post create container has default offset height and less than 50% of viewport height
            expect(postCreateContainer.offsetHeight).to.eq(postCreateContainerDefaultHeight).and.lessThan(halfViewportHeight);

            // * Check if reply text box has default offset height and less than post create container default offset height
            expect(replyTextBox.offsetHeight).to.eq(replyTextBoxDefaultHeight).and.lessThan(postCreateContainerDefaultHeight);
        });

        // # Enter new lines into RHS so that box should reach max height, verify last reply, and verify heights
        newLinesCount = 25;
        enterNewLinesAndVerifyLastReplyAndHeights(newLinesCount, postCreateContainerClassName, padding, halfViewportHeight, postCreateContainerDefaultHeight);

        // # Enter more new lines into RHS, verify last reply, and verify heights
        newLinesCount *= 2;
        enterNewLinesAndVerifyLastReplyAndHeights(newLinesCount, postCreateContainerClassName, padding, halfViewportHeight, postCreateContainerDefaultHeight);

        // # Get first reply and scroll into view
        cy.getNthPostId(-maxReplyCount).then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).scrollIntoView();
            cy.wait(TIMEOUTS.HALF_SEC);
        });

        // # Type new message to reply text box and verify last reply
        cy.get('@replyTextBox').type('new message');
        verifyLastReply();
        cy.get('@replyTextBox').clear();
    });

    it('correctly scrolls to the bottom when a thread is opened', () => {
        cy.get('.post-right__scroll').scrollIntoView();
        cy.closeRHS();
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });
        cy.get('#addCommentButton').should('be.visible');
    });

    it('correctly scrolls to the bottom when the user types in the comment box', () => {
        cy.get('.post-right__scroll').scrollIntoView();
        cy.get(`#${replyTextBoxId}`).type('foo', {scrollBehavior: false}); // without scrollBehavior=false cypress automatically scrolls to replyTextBox. We need to check if application does that.
        cy.get('#addCommentButton').should('be.visible');
    });

    function enterNewLinesAndVerifyLastReplyAndHeights(newLinesCount, postCreateContainerClassName, padding, halfViewportHeight, postCreateContainerDefaultHeight) {
        const newLines = '{shift}{enter}'.repeat(newLinesCount);
        cy.get('@replyTextBox').type(newLines);
        verifyLastReply();
        verifyHeights(postCreateContainerClassName, padding, halfViewportHeight, postCreateContainerDefaultHeight);
    }

    function verifyLastReply() {
        // * Check last reply is visible
        cy.getLastPostId().then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', `post ${maxReplyCount}`);
        });
    }

    function verifyHeights(postCreateContainerClassName, padding, halfViewportHeight, postCreateContainerDefaultHeight) {
        // # Get post create container and reply text box
        cy.document().then((doc) => {
            const postCreateContainer = doc.getElementsByClassName(postCreateContainerClassName)[0];
            const replyTextBox = doc.getElementById(replyTextBoxId);

            // * Check if post create container offset height is 50% of viewport height
            expect(postCreateContainer.offsetHeight - padding).to.eq(halfViewportHeight);

            // * Check if reply text box offset height is greater than post create container default height
            expect(replyTextBox.offsetHeight).to.be.greaterThan(postCreateContainerDefaultHeight);

            // * Check if reply text box height attribute is greater than reply text box offset height
            cy.get(`#${replyTextBoxId}`).should('have.attr', 'height').then((height) => {
                expect(Number(height)).to.be.greaterThan(replyTextBox.offsetHeight);
            });
        });
    }
});
