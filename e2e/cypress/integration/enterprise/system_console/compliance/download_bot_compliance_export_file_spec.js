// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import {downloadAndUnzipExportFile, getXMLFile, deleteExportFolder} from './helpers';

const ExportFormatActiance = 'Actiance XML';
const path = require('path');

describe('Compliance Export', () => {
    let targetDownload;
    let newTeam;
    let newChannel;
    let botId;
    let botName;

    before(() => {
        cy.exec('PWD').then((result) => {
            const pwd = result.stdout;
            targetDownload = path.join(pwd, 'Downloads');
        });

        cy.apiRequireLicenseForFeature('Compliance');

        cy.apiUpdateConfig({
            MessageExportSettings: {
                ExportFormat: 'csv',
                DownloadExportResults: true,
            },
            ServiceSettings: {
                EnforceMultifactorAuthentication: false,
                EnableBotAccountCreation: true,
            },
        });

        cy.apiInitSetup().then(({team, channel}) => {
            newTeam = team;
            newChannel = channel;
        });

        //# Create a test bot
        cy.apiCreateBot().then(({bot}) => {
            ({user_id: botId, display_name: botName} = bot);
            cy.apiPatchUserRoles(bot.user_id, ['system_admin', 'system_user']);
        });
    });

    afterEach(() => {
        deleteExportFolder(targetDownload);
    });

    it('MM-T1175_1 - UserType identifies that the message is posted by a bot', () => {
        // # Post bot message
        postBOTMessage(newTeam, newChannel, botId, botName, 'This is CSV bot message');

        // # Go to Compliance page and Run report
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport();
        cy.uiExportCompliance();

        // # Download and Unzip exported file
        downloadAndUnzipExportFile(targetDownload);

        // * Export file should contain bot messages
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string', `This is CSV bot message ${botName},message,bot`);
    });

    it('MM-T1175_2 - UserType identifies that the message is posted by a bot', () => {
        // # Post bot message
        postBOTMessage(newTeam, newChannel, botId, botName, 'This is XML bot message');

        // # Go to Compliance and enable Run export
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport(ExportFormatActiance);
        cy.uiExportCompliance();

        // # Download and Unzip exported File
        downloadAndUnzipExportFile(targetDownload);

        // * Export file should contain Delete text
        getXMLFile(targetDownload).then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `This is XML bot message ${botName}`).
                and('have.string', '<UserType>bot</UserType>');
        });
    });
});

function postBOTMessage(newTeam, newChannel, botId, botName, message) {
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
}
