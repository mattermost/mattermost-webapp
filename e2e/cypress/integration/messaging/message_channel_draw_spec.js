// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';
import axios, { AxiosResponse } from 'axios';
describe('Draw plugin : Post message', () => {
    const fileName = 'com.mattermost.draw-plugin.tar.gz';
    const fileType = 'application/gzip';
    const pluginId = 'com.mattermost.draw-plugin';

    before(() => {
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Login with admin access and upload Draw plugin
        cy.apiLogin('sysadmin').visit('/');
        cy.uploadFormPlugin1();
        cy.drawpluginConfiguration('Enable', fileName, fileType);

        // # Login with user-1
        cy.apiLogin('user-1').visit('/');
        cy.get('#post_textbox').clear().type('This check is for draw plugin');
    });

    after(() => {
        // # UnInstall Draw plugin
        cy.apiLogin('sysadmin').visit('/');
        cy.uninstallPluginById(pluginId);
    });

    it('M11759-Draw plugin : Post message check for Draw Plugin & My Computer events', () => {
        //Assertion 1 : Upload image via draw plugin and check Message doesn't post

        // # Open file upload options - Select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * upload a file and verify drafted message still exist in textbox
        cy.get('canvas').trigger('pointerdown').trigger('pointerup').click();
        cy.findByText('Upload').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

        //Assertion 2 :Cancel draw plugin upload and check Message doesn't post

        // # Open file upload options - Select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * Cancel the file upload process and verify drafted message still exist in textbox
        cy.findByText('Cancel').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

        //Assertion 3 : click on Your Computer and check message doesn't post

        // # Open file upload options - Select your computer plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Your computer').click();

        // * Click on my computer and verify drafted message still exist in textbox
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
    });
});



function postFormData(url, formData, token){
    let credentials = btoa( users['sysadmin'].username +':'+ users['sysadmin'].password);
    let basicAuth = 'Basic ' + credentials;
  return cy.wrap(
    axios(url, {
      method: 'post',
      url,
      data: formData,
      headers: {
          'Authorization':basicAuth,
        //'Cookie':cy.getCookies({log: false}),
        'Content-Type': 'multipart/form-data'
      }
    })
  )
}

Cypress.Commands.add('postFormData', postFormData)
Cypress.Commands.add('uploadFormPlugin',() => {
    
    const fileName = 'com.mattermost.draw-plugin.tar.gz';
       
    const fileType = 'application/gzip';
   
    // Get file from fixtures as binary
    cy.fixture(fileName, 'binary').then( (content) => {

        // File in binary format gets converted to blob so it can be sent as Form data
        Cypress.Blob.binaryStringToBlob(content, fileType).then((blob) => {

            // Build up the form
            const formData = new FormData();
            formData.set('file', blob, fileName); //adding a file to the form
           
            //});
            //formData.append('------');
            cy.request({
                url: '/api/v4/plugins',
                method: 'POST',
                body:formData,
                headers: {
                   //'Content-type': 'multipart/form-data; boundary=------------------------' +Math.random().toString().substr(2),
                   'Content-type': 'multipart/form-data',
                   //'Content-type': 'undefined',
                  'Accept': '*/*',
                  'X-Requested-With': 'XMLHttpRequest',
                  //'Content-Encoding': 'application/gzip',
                  //'Content-Disposition': 'form-data',
                  //'X-CSRF-Token': 'ouhtzcoqmbyepxbqt588mjhf8c',
                  'Cookie':cy.getCookies({log: false})
                },
                files: {
                  file: content
                }
            // fetch('http://localhost:8065/api/v4/plugins', options).then(function(response) {
            //       if (response.status !== 200) {
            //         console.log('Looks like there was a problem. Status Code: ' +
            //           response.status);
            //       }
               
            }).then(response => {
                log("response is:"+response.toString);
                expect(response.status).to.equal(201); 
            });
        });
    });
});
    Cypress.Commands.add('uploadFormPlugin1',() => {
    
        const fileName = 'com.mattermost.draw-plugin.tar.gz';           
        const fileType = 'application/gzip';
       
        // Get file from fixtures as binary
        cy.fixture(fileName, 'binary').then( (content) => {
    
            // File in binary format gets converted to blob so it can be sent as Form data
            Cypress.Blob.binaryStringToBlob(content, fileType).then((blob) => {
    
                // Build up the form
                const formData = new FormData();
                formData.set('file', blob, fileName); //adding a file to the form
               cy.form_request("POST","http://localhost:8065/api/v4/plugins",formData,function (response) {
                   // log("response is:"+response.toString);
                    expect(response.status).to.equal(201); 
                });
            });
        });
    });  
    Cypress.Commands.add('form_request', (method, url, formData, done) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url,false,'sysadmin','Sys@dmin-sample1');
        xhr.withCredentials = true;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8065");
        xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST,PUT");
        //xhr.setRequestHeader('x-csrf-token', cy.getCookie('MMCSRF').toString());
        //xhr.setRequestHeader('Cookie',cy.getCookies({log: false}));
        xhr.onload = function () {
            done(xhr);
        };
        xhr.onerror = function () {
            done(xhr);
        };
        xhr.send(formData);
    })
 
