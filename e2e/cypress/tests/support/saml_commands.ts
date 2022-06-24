// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';
import {stubClipboard} from '../utils';

import {CheckLeftSidebarOptions, CheckLoginSettings} from './common_login_commands';

export interface CreateTeamSettings {
    user: {
        isGuest: boolean;
        userType: string;
    };
}

function checkCreateTeamPage(settings: CreateTeamSettings) {
    if (settings.user.userType === 'Guest' || settings.user.isGuest) {
        cy.findByText('Create a team').scrollIntoView().should('not.exist');
    } else {
        cy.findByText('Create a team').scrollIntoView().should('be.visible');
    }
}
Cypress.Commands.add('checkCreateTeamPage', checkCreateTeamPage);

interface DoSamlLoginSettings {
    loginButtonText?: string;
    siteName?: string;
}

function doSamlLogin(settings: DoSamlLoginSettings = {}) {
    // # Go to login page
    cy.apiLogout();
    cy.visit('/login');
    cy.checkLoginPage(settings);

    //click the login button
    cy.findByText(settings.loginButtonText).should('be.visible').click().wait(TIMEOUTS.ONE_SEC);
}
Cypress.Commands.add('doSamlLogin', doSamlLogin);

type DoSamlLogoutSettings = CheckLeftSidebarOptions & CheckLoginSettings;
function doSamlLogout(settings: DoSamlLogoutSettings) {
    cy.checkLeftSideBar(settings);

    // # Logout then check login page
    cy.uiLogout();
    cy.checkLoginPage(settings);
}
Cypress.Commands.add('doSamlLogout', doSamlLogout);

function getInvitePeopleLink(settings: CheckLeftSidebarOptions): Cypress.Chainable<string> {
    cy.checkLeftSideBar(settings);

    // # Open team menu and click 'Invite People'
    cy.uiOpenTeamMenu('Invite People');

    stubClipboard().as('clipboard');
    cy.checkInvitePeoplePage();
    cy.findByTestId('InviteView__copyInviteLink').click();
    let string = '';
    cy.get('@clipboard').its('contents').then((text: any) => {
        // # Close Invite People modal
        cy.uiClose();
        string = text;
    });
    return cy.wrap(string);
}
Cypress.Commands.add('getInvitePeopleLink', getInvitePeopleLink);

interface TestSettings {
    loginButtonText: string;
    siteName: string;
    siteUrl: string;
    teamName: string;
    user: null;
}

interface Config {
    TeamSettings: {
        SiteName: string;
    };
    ServiceSettings: {
        SiteURL: string;
    };
}

function setTestSettings(loginButtonText: string, config: Config): Cypress.Chainable<TestSettings> {
    return cy.wrap({
        loginButtonText,
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null,
    });
}
Cypress.Commands.add('setTestSettings', setTestSettings);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            // checkCreateTeamPage checks that members can not create teams,
            // but members can
            checkCreateTeamPage: typeof checkCreateTeamPage;

            // logs user out, and then logs user in
            doSamlLogin: typeof doSamlLogin;

            // logs user out, and then checks log in page
            doSamlLogout: typeof doSamlLogout;

            // gets the url used for sending invites to people
            getInvitePeopleLink: typeof getInvitePeopleLink;

            // setTestSettings gets the settings
            setTestSettings: typeof setTestSettings;
        }
    }
}
