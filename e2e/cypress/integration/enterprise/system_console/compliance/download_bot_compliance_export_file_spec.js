// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

const path = require('path');

const ExportFormatActiance = 'Actiance XML';
let targetDownload;
let fileURL;
let pwd;

describe('Compliance Export', () => {
    let newTeam;
    let newChannel;
    let botId;
    let botName;

    before(() => {
        cy.exec('PWD').then((result) => {
            pwd = result.stdout;
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
        deleteExportFolder();
    });

    it('MM-T1175-01 - UserType identifies that the message is posted by a bot', () => {
        // # Post bot message
        cy.postBOTMessage(newTeam, newChannel, botId, botName, 'This is CSV bot message');

        // # Go to Compliance page and Run report
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Download and Unzip Export file
        downloadAndUnzipExportFile();

        // * Export file should contain bot messages
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string', `This is CSV bot message ${botName},message,bot`);
    });

    it('MM-T1175-02 - UserType identifies that the message is posted by a bot', () => {
        // # Create token for the bot
        cy.postBOTMessage(newTeam, newChannel, botId, botName, 'This is XML bot message');

        // # Go to Compliance and enabele Run export
        cy.gotoCompliancePage();
        cy.enableComplianceExport(ExportFormatActiance);
        cy.exportCompliance();

        // # Download and Unzip Export File
        downloadAndUnzipExportFile();

        // * Export file should contain Delete text
        getXMLFile().then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `This is XML bot message ${botName}`).
                and('have.string', '<UserType>bot</UserType>');
        });
    });
});

const getXMLFile = () => {
    // Finding xml file location
    return cy.exec(`find ${targetDownload} -name '*.xml'`);
};

function deleteExportFolder() {
    // # Delete local download folder
    cy.exec(`rm -rf ${targetDownload}`);
}

function downloadAndUnzipExportFile() {
    // # Get the download link
    cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
        // # Getting export file url
        fileURL = fileAttachment.attr('href');

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

