// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * ellipsis validator permit to expect if an element is show with css ellipsis in DOM
 * Inspiration https://stackoverflow.com/a/19304167
 *
 * @param {boolean} shouldBe True to assert element should be ellipsis (display with '...'), False otherwise
 * @example cy.get('#myId').ellipsis(true)
 */
Cypress.Commands.add('ellipsis', {prevSubject: true}, (subject, shouldBe) => {
    if (shouldBe) {
        expect(subject.outerWidth()).lt(subject[0].scrollWidth);
    } else {
        expect(subject.outerWidth()).to.be.closeTo(subject[0].scrollWidth, 0.1);
    }
    return subject;
});