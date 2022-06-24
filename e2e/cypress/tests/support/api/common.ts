// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import path from 'path';

import * as TIMEOUTS from '../../fixtures/timeouts';

import {ChainableT} from './types';

// *****************************************************************************
// Common / Helper commands
// *****************************************************************************
interface UploadOptions {
    method?: string;
    url?: string;
    successStatus?: number;
}
function apiUploadFile(name: string, filePath: string, options: UploadOptions = {}): ChainableT<any> {
    const formData = new FormData();
    const filename = path.basename(filePath);

    return cy.fixture(filePath, 'binary', {timeout: TIMEOUTS.TWENTY_MIN}).
        then(Cypress.Blob.binaryStringToBlob).
        then((blob) => {
            formData.set(name, blob, filename);
            formRequest(options.method, options.url, formData, options.successStatus);
        });
}
Cypress.Commands.add('apiUploadFile', apiUploadFile);

function apiDownloadFileAndVerifyContentType(fileURL: string, contentType = 'application/zip') {
    cy.request(fileURL).then((response) => {
        // * Verify the download
        expect(response.status).to.equal(200);

        // * Confirm its content type
        expect(response.headers['content-type']).to.equal(contentType);
    });
}
Cypress.Commands.add('apiDownloadFileAndVerifyContentType', apiDownloadFileAndVerifyContentType);

/**
 * Process binary file HTTP form request.
 */
function formRequest(method: string, url: string, formData: FormData, successStatus: number) {
    const baseUrl = Cypress.config('baseUrl');
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, false);
    let cookies = '';
    cy.getCookie('MMCSRF', {log: false}).then((token) => {
        //get MMCSRF cookie value
        const csrfToken = token.value;
        cy.getCookies({log: false}).then((cookieValues) => {
            //prepare cookie string
            cookieValues.forEach((cookie) => {
                cookies += cookie.name + '=' + cookie.value + '; ';
            });

            //set headers
            xhr.setRequestHeader('Access-Control-Allow-Origin', baseUrl);
            xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
            xhr.setRequestHeader('X-CSRF-Token', csrfToken);
            xhr.setRequestHeader('Cookie', cookies);
            xhr.send(formData);
            if (xhr.readyState === 4) {
                expect(xhr.status, 'Expected form request to be processed successfully').to.equal(successStatus);
            } else {
                expect(xhr.status, 'Form request process delayed').to.equal(successStatus);
            }
        });
    });
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Upload file directly via API.
             * @param {String} name - name of form
             * @param {String} filePath - path of the file to upload; can be relative or absolute
             * @param {Object} options - request options
             * @param {String} options.url - HTTP resource URL
             * @param {String} options.method - HTTP request method
             * @param {Number} options.successStatus - HTTP status code
             *
             * @example
             *   cy.apiUploadFile('certificate', filePath, {url: '/api/v4/saml/certificate/public', method: 'POST', successStatus: 200});
             */
            apiUploadFile: typeof apiUploadFile;

            /**
             * Verify export file content-type
             * @param {String} fileURL - Export file URL
             * @param {String} contentType - File content-Type
             */
            apiDownloadFileAndVerifyContentType: typeof apiDownloadFileAndVerifyContentType;
        }
    }
}
