// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import path from 'path';

import * as TIMEOUTS from '../../../../fixtures/timeouts';

export function downloadAndUnzipExportFile(targetDownload) {
    // # Get the download link
    cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
        // # Getting export file url
        const fileURL = fileAttachment.attr('href');

        const zipFilePath = path.join(targetDownload, 'export.zip');

        // # Downloading zip file
        cy.request({url: fileURL, encoding: 'binary'}).then((response) => {
            expect(response.status).to.equal(200);
            cy.writeFile(zipFilePath, response.body, 'binary');
        });

        // # Unzipping exported file
        cy.exec(`unzip ${zipFilePath} -d ${targetDownload}`);
        cy.exec(`find ${targetDownload}/export -name '*.zip' | xargs unzip -d ${targetDownload}`);
    });
}

export function getXMLFile(targetDownload) {
    // Finding xml file location
    return cy.exec(`find ${targetDownload} -name '*.xml'`);
}

export function deleteExportFolder(targetDownload) {
    // Delete local download folder
    cy.exec(`rm -rf ${targetDownload}`);
}

export function verifyExportedMessagesCount(expectedNumber) {
    // * Verifying no of exported messages
    cy.get('@firstRow').find('td:eq(5)').should('have.text', `${expectedNumber} messages exported.`);
}

export function editLastPost(message) {
    cy.getLastPostId().then(() => {
        cy.get('#post_textbox').clear().type('{uparrow}');

        // # Edit post modal should appear
        cy.get('#editPostModal').should('be.visible');

        // # Update the post message and type ENTER
        cy.get('#edit_textbox').invoke('val', '').type(`${message}`).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Edit modal should not be visible
        cy.get('#editPostModal').should('not.exist');
    });
}

export function gotoTeamAndPostImage() {
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

    // # Remove images from post message footer if exist
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        if (el.find('.post-image.normal').length > 0) {
            cy.get('.file-preview__remove > .icon').click();
        }
        return el.find('.post-image.normal').length === 0;
    }));
    const file = {
        filename: 'image-400x400.jpg',
        originalSize: {width: 400, height: 400},
        thumbnailSize: {width: 400, height: 400},
    };
    cy.get('#fileUploadInput').attachFile(file.filename);

    // # Wait until the image is uploaded
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image.normal').length > 0;
    }), {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Unable to upload attachment in time',
    });

    cy.postMessage(`file uploaded-${file.filename}`);
}

