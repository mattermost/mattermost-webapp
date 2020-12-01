// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {hexToRgbArray, rgbArrayToString} from '../../../../utils';

const FAKE_SETTING = '********************************';
const SERVICE_PROIVDER_LABEL = 'Select Service Provider:';
const DISCOVERY_ENDPOINT_LABEL = 'Discovery Endpoint:';
const CLIENT_ID_LABEL = 'Client ID:';
const CLIENT_SECRET_LABEL = 'Client Secret:';
const OPENID_LINK_NAME = 'OpenID Connect';
const SAVE_BUTTON_NAME = 'Save';
const CONVERT_NAME = 'Convert to OpenID Connect';
const OAUTH2_NAME = 'OAuth 2.0deprecated';


// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

const verifyOAuthLogin = (id, text, color, href) => {
    cy.apiLogout();

    cy.findByRole('link',{name: `${text}`}).then((btn) =>{
        expect(btn[0].href).equal(href);
        if (color) {
            const rbgArr = hexToRgbArray(color);
            expect(btn[0].style.backgroundColor).equal(rgbArrayToString(rbgArr));
        }
    });
};

describe('MM-27688 - System console-OpenId Connect', () => {
    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();
    });
    it('MM-27688 - Set to Generic OpenId', () => {
        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();

        cy.findByRole('link', { name: OPENID_LINK_NAME }).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);

        cy.findByLabelText(SERVICE_PROIVDER_LABEL).select('openid').wait(TIMEOUTS.ONE_SEC);

        cy.findByLabelText('Button Name:').clear().type('TestButtonTest');

        cy.get('#OpenIdSettings\\.ButtonColor-inputColorValue').clear().type('#c02222');

        cy.findByLabelText(DISCOVERY_ENDPOINT_LABEL).clear().type('http://test.com/.well-known/openid-configuration');
        cy.findByLabelText(CLIENT_ID_LABEL).clear().type('OpenIdId');
        cy.findByLabelText(CLIENT_SECRET_LABEL).clear().type('OpenIdSecret');

        cy.findByRole('button',{name: SAVE_BUTTON_NAME}).click().wait(TIMEOUTS.ONE_SEC);

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.OpenIdSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.OpenIdSettings.Id).to.equal('OpenIdId');
            expect(config.OpenIdSettings.DiscoveryEndpoint).to.equal('http://test.com/.well-known/openid-configuration');
        });

        verifyOAuthLogin('OpenIdButton', 'TestButtonTest', '#c02222', 'http://localhost:8065/oauth/openid/login?extra=expired');
    });

    it('MM-27688 - Set to Google OpenId', () => {
        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();

        cy.findByRole('link', { name: OPENID_LINK_NAME }).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);

        cy.findByLabelText(SERVICE_PROIVDER_LABEL).select('google').wait(TIMEOUTS.ONE_SEC);

        cy.findByLabelText(CLIENT_ID_LABEL).clear().type('GoogleId');
        cy.findByLabelText(CLIENT_SECRET_LABEL).clear().type('GoogleSecret');

        cy.findByRole('button',{name: SAVE_BUTTON_NAME}).click().wait(TIMEOUTS.ONE_SEC);

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.GoogleSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.GoogleSettings.Id).to.equal('GoogleId');
            expect(config.GoogleSettings.DiscoveryEndpoint).to.equal('https://accounts.google.com/.well-known/openid-configuration');
        });

        verifyOAuthLogin('GoogleButton', 'Google Apps', '', 'http://localhost:8065/oauth/google/login?extra=expired');
    });

    it('MM-27688- Set to Gitlab OpenId', () => {
        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();

        cy.findByRole('link', { name: OPENID_LINK_NAME }).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);
        cy.findByLabelText(SERVICE_PROIVDER_LABEL).select('gitlab').wait(TIMEOUTS.ONE_SEC);

        cy.findByLabelText('GitLab Site URL:').clear().type('https://gitlab.com');
        cy.findByLabelText(CLIENT_ID_LABEL).clear().type('GitlabId');
        cy.findByLabelText(CLIENT_SECRET_LABEL).clear().type('GitlabSecret');

        cy.findByRole('button',{name: SAVE_BUTTON_NAME}).click().wait(TIMEOUTS.ONE_SEC);

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.GitLabSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.GitLabSettings.Id).to.equal('GitlabId');
            expect(config.GitLabSettings.DiscoveryEndpoint).to.equal('https://gitlab.com/.well-known/openid-configuration');
        });

        verifyOAuthLogin('GitLabButton', 'GitLab', '', 'http://localhost:8065/oauth/gitlab/login?extra=expired');
    });

    it('MM-27688 - Set to Exchange OpenId', () => {
        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();

        cy.findByRole('link', { name: OPENID_LINK_NAME }).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);
        cy.findByLabelText(SERVICE_PROIVDER_LABEL).select('office365').wait(TIMEOUTS.ONE_SEC);

        cy.findByLabelText('Directory (tenant) ID:').clear().type('common');
        cy.findByLabelText(CLIENT_ID_LABEL).clear().type('Office365Id');
        cy.findByLabelText(CLIENT_SECRET_LABEL).clear().type('Office365Secret');

        cy.findByRole('button',{name: SAVE_BUTTON_NAME}).click().wait(TIMEOUTS.ONE_SEC);

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.Office365Settings.Secret).to.equal(FAKE_SETTING);
            expect(config.Office365Settings.Id).to.equal('Office365Id');
            expect(config.Office365Settings.DiscoveryEndpoint).to.equal('https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration');
        });
        verifyOAuthLogin('Office365Button', 'Office 365', '', 'http://localhost:8065/oauth/office365/login?extra=expired');
    });

    it('MM-27688 - Test Migrate from OAuth', () => {
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            GitLabSettings: {
                Enable: false,
                Secret: 'secret',
                Id: 'app_id',
                Scope: '',
                AuthEndpoint: 'https://gitlab.com/oauth/authorize',
                TokenEndpoint: 'https://gitlab.com/oauth/token',
                UserApiEndpoint: 'https://gitlab.com/api/v4/user',
            },
            GoogleSettings: {
                Enable: false,
                Secret: 'secret',
                Id: 'app_id',
                Scope: 'profile email',
                AuthEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                TokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
                UserApiEndpoint: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,nicknames,metadata',
            },
            Office365Settings: {
                Enable: false,
                Secret: 'secret',
                Id: 'app_id',
                Scope: 'User.Read',
                AuthEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                TokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                UserApiEndpoint: 'https://graph.microsoft.com/v1.0/me',
                DirectoryId: 'common',
            },
        });

        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();

        // OAuth button should be visible
        cy.findByRole('link', { name: OAUTH2_NAME }).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);

        // OpenId Convert should be visible
        cy.findByRole('button', { name: CONVERT_NAME }).click();

        // OAuth should no longer be visible
        cy.findByRole('link', { name: OAUTH2_NAME }).should('be.not.visible');

        // OAuth should no longer be visible
        cy.findByRole('link', { name: OPENID_LINK_NAME }).click().wait(TIMEOUTS.ONE_SEC);

        cy.get('#openidType').select('office365').wait(TIMEOUTS.ONE_SEC);
        cy.findByRole('button', { name: CONVERT_NAME }).should('be.not.visible');

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.GitLabSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.GitLabSettings.Id).to.equal('app_id');
            expect(config.GitLabSettings.DiscoveryEndpoint).to.equal('https://gitlab.com/.well-known/openid-configuration');
            expect(config.GitLabSettings.AuthEndpoint).to.equal('');
            expect(config.GitLabSettings.TokenEndpoint).to.equal('');
            expect(config.GitLabSettings.UserApiEndpoint).to.equal('');

            expect(config.GoogleSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.GoogleSettings.Id).to.equal('app_id');
            expect(config.GoogleSettings.DiscoveryEndpoint).to.equal('https://accounts.google.com/.well-known/openid-configuration');
            expect(config.GoogleSettings.AuthEndpoint).to.equal('');
            expect(config.GoogleSettings.TokenEndpoint).to.equal('');
            expect(config.GoogleSettings.UserApiEndpoint).to.equal('');

            expect(config.Office365Settings.Secret).to.equal(FAKE_SETTING);
            expect(config.Office365Settings.Id).to.equal('app_id');
            expect(config.Office365Settings.DiscoveryEndpoint).to.equal('https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration');
            expect(config.Office365Settings.AuthEndpoint).to.equal('');
            expect(config.Office365Settings.TokenEndpoint).to.equal('');
            expect(config.Office365Settings.UserApiEndpoint).to.equal('');
        });
    });
});
