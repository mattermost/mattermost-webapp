// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings', () => {
    before(() => {
        cy.apiAdminLogin().apiInitSetup({loginAfter: true}).its('user').as('user');
    });

    it('MM-T2079 Can remove profile pic then choose different pic without saving in between', function() {
        // # Add a profile picture (aka "old profile picture")
        cy.apiUploadFile('image', 'mattermost-icon.png', {
            url: `/api/v4/users/${this.user.id}/image`,
            method: 'POST',
            successStatus: 200,
        });

        cy.visit('/');

        // # Save the id of the old picture
        cy.uiGetProfileHeader().find('.Avatar').invoke('attr', 'src').then(getPictureId).as('idOld');

        // # Open Profile > Profile Settings > Profile Picture > Edit
        cy.uiOpenProfileModal().findByRole('button', {name: /picture edit/i}).click();

        // # Click the X to remove the old profile picture but do not click save
        cy.findByRole('button', {name: /remove profile picture/i}).click();

        // # Select a new profile picture and click Save
        cy.findByTestId('uploadPicture').attachFile('png-image-file.png');
        cy.uiSave().wait(TIMEOUTS.HALF_SEC);
        cy.findByRole('button', {name: /close/i}).click();

        // * Verify that new profile image exists and isn't equal to the old one
        cy.uiGetProfileHeader().
            find('.Avatar').
            invoke('attr', 'src').
            then(getPictureId).
            then((idNew) => expect(idNew).to.exist.and.not.to.be.equal(this.idOld));
    });
});

function getPictureId(urlString) {
    const url = new URL(urlString);
    const params = new URLSearchParams(url.search);
    return params.get('_');
}

