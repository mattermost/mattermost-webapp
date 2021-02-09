// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.add('verifyingExportedMessages', (number = {}) => {
    cy.get('@firstRow').find('td:eq(5)').should('have.text', `${number} messages exported.`);
});

Cypress.Commands.add('editPost', (message = '') => {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);

        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').clear().type('{uparrow}');

            // # Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${message}`).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            cy.get('#editPostModal').should('be.not.visible');
        });
    });
});

Cypress.Commands.add('gotoTeamAndPostMessage', () => {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.postMessage('Hello This is Testing');
    });
});

Cypress.Commands.add('enableComplianceExport', (exportFormate = 'csv') => {
    // # Enable compliance export
    cy.findByTestId('enableComplianceExporttrue').click();

    // # Change export format
    cy.findByTestId('exportFormatdropdown').select(exportFormate);

    // # Save settings
    cy.findByTestId('saveSetting').click();

    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
});

Cypress.Commands.add('gotoCompliancePage', () => {
    cy.visit('/admin_console/compliance/export');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Compliance Export');
});

Cypress.Commands.add('gotoTeamAndPostImage', () => {
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
});

Cypress.Commands.add('exportCompliance', () => {
    // # Click the export job button
    cy.contains('button', 'Run Compliance Export Job Now').click();

    // # Small wait to ensure new row is add
    cy.wait(TIMEOUTS.THREE_SEC);

    // # Get the first row
    cy.get('.job-table__table').
        find('tbody > tr').
        eq(0).
        as('firstRow');

    // # Get the first table header
    cy.get('.job-table__table').find('thead > tr').as('firstheader');

    // # Wait until export is finished
    cy.waitUntil(() => {
        return cy.get('@firstRow').find('td:eq(1)').then((el) => {
            return el[0].innerText.trim() === 'Success';
        });
    },
    {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Compliance export did not finish in time',
    });
});

Cypress.Commands.add('downloadAttachmentAndVerifyItsProperties', (fileURL = {}) => {
    cy.request(fileURL).then((response) => {
        // * Verify the download
        expect(response.status).to.equal(200);

        // * Confirm it's a zip file
        expect(response.headers['content-type']).to.equal('application/zip');
    });
});

Cypress.Commands.add('deleteLastPost', () => {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.getLastPostId().then((lastPostId) => {
        // # Click post dot menu in center.
            cy.clickPostDotMenu(lastPostId);

            // # Scan inside the post menu dropdown
            cy.get(`#CENTER_dropdown_${lastPostId}`).should('exist').within(() => {
                // # Click on the delete post button from the dropdown
                cy.findByText('Delete').should('exist').click();
            });
        });
        cy.get('.a11y__modal.modal-dialog').should('exist').and('be.visible').
            within(() => {
                // # Confirm click on the delete button for the post
                cy.findByText('Delete').should('be.visible').click();
            });
    });
});

Cypress.Commands.add('gotoTeam', () => {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });
});

Cypress.Commands.add('postBOTMessage', (newTeam, newChannel, botId, botName, message) => {
    cy.apiCreateToken(botId).then(({token}) => {
        // # Logout to allow posting as bot
        cy.apiLogout();
        const msg1 = `${message} ${botName}`;
        cy.apiCreatePost(newChannel.id, msg1, '', {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token);

        // # Re-login to validate post presence
        cy.apiAdminLogin();
        cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

        // * Validate post was created
        cy.findByText(msg1).should('be.visible');
    });
});
