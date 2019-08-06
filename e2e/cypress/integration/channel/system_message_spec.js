// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// helper function to count the lines in a block of text by wrapping each word in a span and finding where the text breaks the line
function getLines(e) {
    const $cont = Cypress.$(e);
    const textArr = $cont.text().split(' ');

    for (let i = 0; i < textArr.length; i++) {
        textArr[i] = '<span>' + textArr[i] + ' </span>';
    }

    $cont.html(textArr.join(''));

    const $wordSpans = $cont.find('span');
    const lineArray = [];
    var lineIndex = 0;
    var lineStart = true;

    $wordSpans.each(function handleWord(idx) {
        const top = Cypress.$(this).position().top;

        if (lineStart) {
            lineArray[lineIndex] = [idx];
            lineStart = false;
        } else {
            var $next = Cypress.$(this).next();

            if ($next.length) {
                if ($next.position().top > top) {
                    lineArray[lineIndex].push(idx);
                    lineIndex++;
                    lineStart = true;
                }
            } else {
                lineArray[lineIndex].push(idx);
            }
        }
    });
    return lineArray.length;
}

describe('System Message', () => {
    before(() => {
        // # Login and and set user preference
        cy.apiLogin('user-1');
        cy.apiSaveTeammateNameDisplayPreference('username');

        // # Create new test team
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            cy.visit(`/${response.body.name}`);
        });
    });

    it('MM-14636 - Validate that system message is wrapping properly', () => {
        const newHeader = `${Date.now()} newheader`;

        // # Update channel header textbox
        cy.updateChannelHeader(`> ${newHeader}`);

        // * Check the status update
        cy.getLastPost().
            should('contain', 'System').
            and('contain', '@user-1 updated the channel header to:').
            and('contain', newHeader);

        const validateSingle = (desc) => {
            const lines = getLines(desc.find('p').last());
            assert(lines === 1, 'second line of the message should be a short one');
        };

        cy.getLastPost().then(validateSingle);

        // # Update the status to a long string
        cy.updateChannelHeader('> ' + newHeader.repeat(20));

        // * Check that the status is updated and is spread on more than one line
        cy.getLastPost().
            should('contain', 'System').
            and('contain', '@user-1 updated the channel header from:').
            and('contain', newHeader).
            and('contain', 'to:').
            and('contain', newHeader.repeat(20));

        const validateMulti = (desc) => {
            const lines = getLines(desc.find('p').last());
            assert(lines > 1, 'second line of the message should be a long one');
        };

        cy.getLastPost().then(validateMulti);
    });
});
