// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../../fixtures/timeouts';

const path = require('path');

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
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);

        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').clear().type('{uparrow}');

            // # Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${message}`).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Edit modal should not be visible
            cy.get('#editPostModal').should('not.exist');
        });
    });
}

export function gotoTeamAndPostMessage() {
    // # Get user team
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.postMessage('Hello This is Testing');
    });
}

export function gotoTeamAndPostImage() {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

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

export function gotoGlobalPolicy() {
    cy.get('#global_policy_table .DataGrid .MenuWrapper').trigger('mouseover').click();
    cy.findByRole('button', {name: /edit/i}).should('be.visible').click();
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Global Retention Policy');
}

export function editGlobalPolicyMessageRetention(input, result) {
    cy.get('.DataRetentionSettings #global_direct_message_dropdown #DropdownInput_channel_message_retention').should('be.visible').click();

    cy.get('.channel_message_retention_dropdown__menu .channel_message_retention_dropdown__option span.option_days').should('be.visible').click();

    cy.get('.DataRetentionSettings #global_direct_message_dropdown input#channel_message_retention_input').clear().type(input);
    cy.findByRole('button', {name: /save/i}).should('be.visible').click();

    cy.get('#global_policy_table .DataGrid').should('be.visible');

    cy.findByTestId('global_message_retention_cell').within(() => {
        cy.get('span').should('have.text', result);
    });
}

export function editGlobalPolicyFileRetention(input, result) {
    cy.get('.DataRetentionSettings #global_file_dropdown #DropdownInput_file_retention').should('be.visible').click();

    cy.get('.file_retention_dropdown__menu .file_retention_dropdown__option span.option_days').should('be.visible').click();

    cy.get('.DataRetentionSettings #global_file_dropdown input#file_retention_input').clear().type(input);

    cy.findByRole('button', {name: /save/i}).should('be.visible').click();

    cy.get('#global_policy_table .DataGrid').should('be.visible');

    cy.findByTestId('global_file_retention_cell').within(() => {
        cy.get('span').should('have.text', result);
    });
}
