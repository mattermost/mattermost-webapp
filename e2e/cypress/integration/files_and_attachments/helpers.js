// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

export function downloadAttachmentAndVerifyItsProperties(fileURL, filename, httpContext) {
    // * Verify it has not empty download link
    cy.request(fileURL).then((response) => {
        // * Verify that link can be downloaded
        expect(response.status).to.equal(200);

        // * Verify if link is an appropriate httpContext for opening in new tab or same and that can be saved locally
        // and it contains the correct filename* which will be used to name the downloaded file
        expect(response.headers['content-disposition']).to.
            equal(`${httpContext};filename="${filename}"; filename*=UTF-8''${filename}`);
    });
}

export function waitUntilUploadComplete(thumbnailElement) {
    const options = {
        timeout: TIMEOUTS.HALF_MIN,
        interval: TIMEOUTS.HALF_SEC,
        errorMsg: 'File upload did not complete in time',
    };

    // * Verify the thumbnail exists
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__thumbnail').length > 0;
    }), options);
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find(thumbnailElement).length > 0;
    }), options);

    // # Wait until file upload processing is complete
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image__uploadingTxt').length === 0;
    }), options);

    cy.wait(TIMEOUTS.ONE_SEC);
}

export function attachFile({filePath, fileName, mimeType}) {
    cy.fixture(filePath, 'binary').
        then(Cypress.Blob.binaryStringToBlob).
        then((fileContent) => {
            cy.get('#centerChannelFooter').find('#fileUploadInput').attachFile({
                fileContent,
                fileName,
                mimeType: mimeType || 'application/octet-stream',
                encoding: 'utf8',
            });
        });
}
