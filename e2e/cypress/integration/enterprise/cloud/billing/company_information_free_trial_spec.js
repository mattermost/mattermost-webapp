// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @cloud_only @cloud_trial
// Skip:  @headless @electron // run on Chrome (headed) only

import {getRandomLetter} from '../../../../utils/index';

describe('System Console - Company Information section', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');

        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        gotoCompanyInformationScreen();
    });

    beforeEach(() => {
        // # Click on close button of subscribe window if exist
        cy.get('body').then(($body) => {
            if ($body.find('.cancel-button').length > 0) {
                cy.get('.cancel-button').click();
            }
        });
    });

    it('MM-37051 - Save Info button should not be enabled if any one of the mandetory feild is filled invalid data', () => {
        const companyName = getRandomLetter(30);

        // # click on Add Company Information button
        cy.contains('span', 'Add Company Information').parent().click();

        // # enter valid compnany innformatioon
        cy.get('#input_companyName').clear().type(companyName);
        cy.get('#input_numEmployees').clear().type('10');
        cy.get('#DropdownInput_country_dropdown').click();
        cy.get("#DropdownInput_country_dropdown .DropDown__input > input[type='text']").type('India{enter}');
        cy.get('#input_address').clear().type('test address');
        cy.get('#input_address2').clear().type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').clear().type('test');
        cy.get('#input_postalCode').clear().type('44455');

        // * check save button is enabled
        cy.get('#saveSetting').should('be.enabled');

        // # clear postal code
        cy.get('#input_postalCode').clear();

        // * check save button is disabled
        cy.get('#saveSetting').should('be.disabled');

        // # type valid postal code
        cy.get('#input_postalCode').type('44456');

        // * check save button is enabled
        cy.get('#saveSetting').should('be.enabled');

        // # clear city
        cy.get('#input_city').clear();

        // * check save button is disabled
        cy.get('#saveSetting').should('be.disabled');

        // #  type valid city
        cy.get('#input_city').type('testcity');

        // * check save button is  enabled
        cy.get('#saveSetting').should('be.enabled');

        // # clear company name
        cy.get('#input_companyName').clear();

        // * check save button is disabled
        cy.get('#saveSetting').should('be.disabled');
    });

    it('MM-37051 - Adding the Company Information', () => {
        const companyName = getRandomLetter(30);

        // # click on Add Company Information button
        cy.contains('span', 'Add Company Information').parent().click();

        // # enter company information functionality
        cy.get('#input_companyName').clear().type(companyName);
        cy.get('#input_numEmployees').clear().type('10');
        cy.get('#DropdownInput_country_dropdown').click();
        cy.get("#DropdownInput_country_dropdown .DropDown__input > input[type='text']").type('India{enter}');
        cy.get('#input_address').clear().type('Add test address');
        cy.get('#input_address2').clear().type('Add test address2');
        cy.get('#input_city').clear().type('Addtestcity');
        cy.get('#input_state').clear().type('Addteststate');
        cy.get('#input_postalCode').clear().type('560089');

        // # click on Save Info button
        cy.get('#saveSetting').should('be.enabled').click();

        // * check for persisted company name
        cy.get('.CompanyInfoDisplay__companyInfo-name').should('have.text', companyName);

        // * check for employee number
        cy.get('.CompanyInfoDisplay__companyInfo-numEmployees > span').should('include.text', '10');

        // * check for country
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(3).should('have.text', 'British Indian Ocean Territory');

        // * check for city,state and postal code
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(2).should('have.text', 'Addtestcity, Addteststate, 560089');

        // * check for address 2
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(1).should('have.text', 'Add test address2');

        // * check for address 1
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(0).should('have.text', 'Add test address');
    });

    it('MM-37051 - Editing the Company Information', () => {
        const companyName = getRandomLetter(30);

        // # click on edit Company Information button
        cy.get('.CompanyInfoDisplay__companyInfo-editButton').click();

        // # enter company information functionality
        cy.get('#input_companyName').clear().type(companyName);
        cy.get('#input_numEmployees').clear().type('10');
        cy.get('#DropdownInput_country_dropdown').click();
        cy.get("#DropdownInput_country_dropdown .DropDown__input > input[type='text']").type('India{enter}');
        cy.get('#input_address').clear().type('test address');
        cy.get('#input_address2').clear().type('test2');
        cy.get('#input_city').clear().type('testcity');
        cy.get('#input_state').clear().type('test');
        cy.get('#input_postalCode').clear().type('44455');

        // # click on Save Info button
        cy.get('#saveSetting').should('be.enabled').click();

        // * check for persisted company name
        cy.get('.CompanyInfoDisplay__companyInfo-name').should('have.text', companyName);

        // * check for employee number
        cy.get('.CompanyInfoDisplay__companyInfo-numEmployees > span').should('include.text', '10');

        // * check for country
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(3).should('have.text', 'British Indian Ocean Territory');

        // * check for city,state and postol code
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(2).should('have.text', 'testcity, test, 44455');

        // * check for address 2
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(1).should('have.text', 'test2');

        // * check for address 1
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(0).should('have.text', 'test address');
    });

    it('MM-37051 - Cancelling of editing of company information details', () => {
        // # click Add edit Information button
        cy.get('.CompanyInfoDisplay__companyInfo-editButton').click();

        // # click back button of Edit Company Information
        cy.contains('span', 'Edit Company Information').prev().click();

        // * check for back functionality using back button of edit company information screen
        cy.get('.CompanyInfoDisplay__companyInfo-editButton').should('be.visible');

        // # click Add Company Information button
        cy.get('.CompanyInfoDisplay__companyInfo-editButton').click();

        // # enter company information functionality
        cy.get('#input_companyName').clear().type('CancelcompanyName');
        cy.get('#input_numEmployees').clear().type('11');
        cy.get('#DropdownInput_country_dropdown').click();
        cy.get("#DropdownInput_country_dropdown .DropDown__input > input[type='text']").type('Albania{enter}');
        cy.get('#input_address').clear().type('canceltest address');
        cy.get('#input_address2').clear().type('canceltest2');
        cy.get('#input_city').clear().type('canceltestcity');
        cy.get('#input_state').clear().type('canceltest');
        cy.get('#input_postalCode').clear().type('560072');

        // # click cancel button
        cy.get('.cancel-button').click();

        // * check for visibility of Add Company Information button
        cy.get('.CompanyInfoDisplay__companyInfo-editButton').should('be.visible');

        // * check for persisted company name
        cy.get('.CompanyInfoDisplay__companyInfo-name').should('not.have.text', 'CancelcompanyName');

        // * check for employee number
        cy.get('.CompanyInfoDisplay__companyInfo-numEmployees > span').should('not.include.text', '11');

        // * check for country
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(3).should('not.have.text', 'Albania');

        // * check for city,state and postol code
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(2).should('not.have.text', 'canceltestcity, canceltest, 560072');

        // * check for address 2
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(1).should('not.have.text', 'canceltest2');

        // * check for address 1
        cy.get('.CompanyInfoDisplay__companyInfo-address > div').eq(0).should('not.have.text', 'canceltest address');
    });
});

const gotoCompanyInformationScreen = () => {
    cy.get('.sidebar-header-dropdown__icon').click();
    cy.findByText('System Console').should('be.visible').click();
    cy.findByText('Company Information').should('be.visible').click();
};
