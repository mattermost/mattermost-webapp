// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

/// <reference types="cypress-downloadfile"/>

import * as TIMEOUTS from '../../../../fixtures/timeouts';

const path = require('path');

const EXPORT_FORMAT_CSV = 'csv';
const EXPORT_FORMAT_actiance ='Actiance XML';
const EXPORT_FORMAT_GLOBAL = 'global relay EML';
let zipFilePath,targetDownload,fileURL,lastPostId, pwd;

let botId;
let botUsername;
let botName;
let newTeam;
let newUser;
let newChannel;
let adminUser    

describe('Compliance Export', () => {
    let newTeam;
    let newUser;
    let newChannel;
    let botId;
    let botUsername;
    let botName;
    let adminUser;

    before(() => {
        const EXPORT_FORMAT_CSV = 'CSV';
        const EXPORT_FORMAT_actiance ='Actiance XML';
        const EXPORT_FORMAT_GLOBAL = 'global relay EML';

        cy.exec('PWD').then((result) => {
            pwd = result.stdout;
            targetDownload = path.join(pwd,'Downloads');
        });

        cy.apiRequireLicenseForFeature('Compliance');

        cy.apiUpdateConfig({
            MessageExportSettings: {
                ExportFormat: "csv",
                DownloadExportResults: true,
            },
            ServiceSettings: {
                EnforceMultifactorAuthentication: false,
                EnableBotAccountCreation: true,
            },
        });

        cy.apiInitSetup().then(({team, user, channel}) => {
            newTeam = team;
            newUser = user;
            newChannel = channel;
        });

        // # Create a test bot
        cy.apiCreateBot().then(({bot}) => {
            ({user_id: botId, username: botUsername, display_name: botName} = bot);
            cy.apiPatchUserRoles(bot.user_id, ['system_admin', 'system_user']);
        });

    });

    beforeEach(()=> {

        cy.apiAdminLogin().then(({user}) => {
            adminUser = user;
        });
        deleteExportFolder();
        
       
    });

    it('MM-T3435 - Download Compliance Export Files - CSV Format', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });

    it('MM-T3438 - Download Compliance Export Files when 0 messages exported', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the File
            downloadAttachmentAndVerifyItsProperties(fileURL);

            // # Export compliance again
            exportCompliance();

            // # Download link should not exist this time
            cy.get('.job-table__table').
                find('tbody > tr:eq(0)').
                findByText('Download').should('not.exist');
        });
    });
    
    it('MM-T3439 - Download Compliance Export Files - S3 Bucket Storage', () => {
        // # Goto file storage settings Page
        cy.visit('/admin_console/environment/file_storage');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'File Storage');

        // # Get AWS credentials
        const AWS_S3_BUCKET = Cypress.env('AWS_S3_BUCKET');
        const AWS_ACCESS_KEY_ID = Cypress.env('AWS_ACCESS_KEY_ID');
        const AWS_SECRET_ACCESS_KEY = Cypress.env('AWS_SECRET_ACCESS_KEY');

        // # Config AWS settings
        cy.findByTestId('FileSettings.DriverNamedropdown').select('amazons3');
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').type(AWS_S3_BUCKET);
        cy.findByTestId('FileSettings.AmazonS3AccessKeyIdinput').type(AWS_ACCESS_KEY_ID);
        cy.findByTestId('FileSettings.AmazonS3SecretAccessKeyinput').type(AWS_SECRET_ACCESS_KEY);

        // # Save file storage settings
        cy.findByTestId('saveSetting').click();

        waitUntilConfigSave();

        // # Goto compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });



// NEW TEST CASES

    it('MM-T1168 - Compliance Export - Run Now, entry appears in job table', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();
        
        // * Verifying table header 
        cy.get('@firstheader').find('th:eq(1)').should('have.text','Status');
        cy.get('@firstheader').find('th:eq(2)').should('have.text','Files');
        cy.get('@firstheader').find('th:eq(3)').should('have.text','Finish Time');
        cy.get('@firstheader').find('th:eq(4)').should('have.text','Run Time');
        cy.get('@firstheader').find('th:eq(5)').should('have.text','Details');
        
        // * Verifying first row data
        cy.get('@firstRow').find('td:eq(1)').should('have.text','Success');
        cy.get('@firstRow').find('td:eq(2)').should('have.text','Download');
        cy.get('@firstRow').find('td:eq(4)').contains('seconds');
        cy.get('@firstRow').find('td:eq(5)').should('have.text','2 messages exported.');

    });

    it('MM-T1169 _ 01 - Compliance Export - CSV and Global Relay', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        for (var i = 1; i < 10; i++) {
            cy.postMessage(`This is the ${i} post`);
        }
        
        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();
        
        
        cy.get('@firstRow').find('td:eq(2)').should('have.text','Download');
        
        cy.get('@firstRow').find('td:eq(5)').should('have.text','10 messages exported.');
    });

    it('MM-T1172 - Compliance Export - Deleted file is indicated in CSV File Export', () => {
    
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();
    
        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();
    
        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();
    
        //downloadAndUnzipExportFile();
       
        deleteLastPost();
        //deleteExportFolder();
    
        // # Goto compliance page and start export
       gotoCompliancePage();
       exportCompliance();
    
        // # Download and extract export zip file
        downloadAndUnzipExportFile();
    
        // # Verifying if export file contains delete
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string',"deleted attachment");
    });

    it('MM-T1173 - Compliance Export - Deleted file is indicated in Actiance XML File Export', () => {
    
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport(EXPORT_FORMAT_actiance);
    
        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();
    
        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();
    
        //downloadAndUnzipExportFile();
       
        deleteLastPost();
        //deleteExportFolder();
    
        // # Goto compliance page and start export
       gotoCompliancePage();
       exportCompliance();
    
        // # Download and extract export zip file
        downloadAndUnzipExportFile();
    
        // # Verifying if export file contains delete
        cy.exec(`find ${targetDownload} -name '*.xml'`).then((result)=>{

            cy.readFile(result.stdout).should('exist').and('have.string',"delete file uploaded-image-400x400.jpg");

        });

        cy.exec(`find ${targetDownload} -name 'image-400x400.jpg'`).then((result)=>{

            expect(result.stdout!==null).to.be.true

        });
        
    
    
    });

    it('MM-T1175-01 - UserType identifies that the message is posted by a bot', () => {

        cy.apiAdminLogin()
        // # Create token for the bot
        cy.postBOTMessage(newTeam,newChannel,botId,botName,'This is CSV bot message');
        gotoCompliancePage();
        enableComplianceExport();
        exportCompliance();

        downloadAndUnzipExportFile();

        // # Verifying if export file contains delete
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string',`This is CSV bot message ${botName},message,bot`);


    });
    
    it('MM-T1175-02 - UserType identifies that the message is posted by a bot', () => {

        cy.apiAdminLogin()
        // # Create token for the bot
        cy.postBOTMessage(newTeam,newChannel,botId,botName,'This is XML bot message');
        gotoCompliancePage();
        enableComplianceExport(EXPORT_FORMAT_actiance);
        exportCompliance();

        downloadAndUnzipExportFile();

        // # Verifying if export file contains delete
        cy.exec(`find ${targetDownload} -name '*.xml'`).then((result)=>{

            cy.readFile(result.stdout).should('exist')
            .and('have.string',`This is XML bot message ${botName}`)
            .and('have.string',`<UserType>bot</UserType>`);

        });

    });
   
    it('MM-T1176 - Compliance export should include updated post after editing' , () => {
       
        gotoCompliancePage();
        enableComplianceExport(EXPORT_FORMAT_actiance);
    
        // # Navigate to a team and post a Message
        gotoTeamAndPostMessage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();
        
        editPost();

        gotoCompliancePage();
        exportCompliance();
        downloadAndUnzipExportFile();

        // # Verifying if export file contains delete
        cy.exec(`find ${targetDownload} -name '*.xml'`).then((result)=>{

            cy.readFile(result.stdout).should('exist').and('have.string','<Content>Hello</Content>');

        });
    });
    
    it.only('MM-T1177 - Compliance export should include updated posts after editing multiple times, exporting multiple times' , () => {
       
        gotoCompliancePage();
        enableComplianceExport(EXPORT_FORMAT_actiance);
    
        // # Navigate to a team and post a Message
        gotoTeamAndPostMessage();

        // # Navigate to a team and post a Message
        gotoTeamAndPostMessage();

        editPost();

        //gotoCompliancePage();
        //exportCompliance();
        
    });






});

function editPost()
{
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visitAndWait(`/${team.name}/channels/town-square`);
   
        cy.getLastPostId().then(() => {
        cy.get('#post_textbox').clear().type('{uparrow}');

        // * Edit post modal should appear
        cy.get('#editPostModal').should('be.visible');

        // * Update the post message and type ENTER
        cy.get('#edit_textbox').invoke('val', '').type('Hello').type('{enter}').wait(TIMEOUTS.HALF_SEC);

        cy.get('#editPostModal').should('be.not.visible');
    

    });
});
    
}

function getAdminAccount() {
    return {
        username: Cypress.env('adminUsername'),
        password: Cypress.env('adminPassword'),
        email: Cypress.env('adminEmail'),
    };
}

function gotoTeamAndPostMessage() {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visitAndWait(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.postMessage(`Hello This is Testing`);

    });

}

function enableComplianceExport(exportFormate=EXPORT_FORMAT_CSV) {
    // # Enable compliance export
    cy.findByTestId('enableComplianceExporttrue').click();

    // # Change export format to CSV
    cy.findByTestId('exportFormatdropdown').select(exportFormate);

    // # Save settings
    cy.findByTestId('saveSetting').click();

    waitUntilConfigSave();
}

function gotoCompliancePage() {
    cy.visitAndWait('/admin_console/compliance/export');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Compliance Export');
}

function gotoTeamAndPostImage() {
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

function exportCompliance() {
    // # Click the export job button
    cy.contains('button', 'Run Compliance Export Job Now').click();

    cy.wait(TIMEOUTS.HALF_SEC);

    // # Get the first row
    cy.get('.job-table__table').
        find('tbody > tr').
        eq(0).
        as('firstRow');

   // # Small wait to ensure new row is add
    // cy.waitUntil(() => {
        
    //     return cy.get('@firstRow').find('td:eq(1)').then((el) => {
    //         return el[0].innerText.trim() === 'Pending';
    //     });
    // },
    // {
    //     timeout: TIMEOUTS.TEN_SEC,
    //     interval: TIMEOUTS.ONE_SEC,
    //     errorMsg: 'Status pending not found',
    // });

    

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
    
}

function downloadAttachmentAndVerifyItsProperties(fileURL) {
    cy.request(fileURL).then((response) => {
        // * Verify the download
        expect(response.status).to.equal(200);

        // * Confirm it's a zip file
        expect(response.headers['content-type']).to.equal('application/zip');
    });
}

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

function deleteLastPost()
{
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visitAndWait(`/${team.name}/channels/town-square`);
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
}

function deleteExportFolder()
{
    cy.exec(`rm -rf ${targetDownload}`);
}


function downloadAndUnzipExportFile()
{
     // # Get the download link
     cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
        
        // # Getting export file url
        fileURL = fileAttachment.attr('href');
        
        cy.log("PWD done");
        const zipFilePath = path.join(targetDownload,'export.zip');
        cy.log(zipFilePath);

        // # Downloading zip file
        cy.request({url: fileURL,encoding: 'binary',}).then((response) => {
            expect(response.status).to.equal(200);
            cy.writeFile(zipFilePath, response.body, 'binary');
        });

        // # Unzipping exported file
        cy.exec(`unzip ${zipFilePath} -d ${targetDownload}`);
        cy.exec(`find ${targetDownload}/export -name '*.zip' | xargs unzip -d ${targetDownload}`);
        
    }); 

}

function findFile(){
    cy.exec(`find ${targetDownload} -name '*.xml'`).then((result)=>{
        return result.stdout;
    });


}