// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @not_cloud @extend_session

import {verifyExtendedSession, verifyNotExtendedSession} from './helpers';

describe('Extended Session Length', () => {
    const sessionLengthInDays = 1;
    const setting = {
        ServiceSettings: {
            SessionLengthWebInDays: sessionLengthInDays,
        },
    };
    let emailUser;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.apiRequireLicense();

        // * Server database should match with the DB client and config at "cypress.json"
        cy.apiRequireServerDBToMatch();

        cy.apiInitSetup().then(({user}) => {
            emailUser = user;
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiRevokeUserSessions(emailUser.id);
    });

    it('MM-T4045_1 Email user session should have extended due to user activity when enabled', () => {
        // # Enable ExtendSessionLengthWithActivity
        setting.ServiceSettings.ExtendSessionLengthWithActivity = true;
        cy.apiUpdateConfig(setting);

        verifyExtendedSession(emailUser, sessionLengthInDays, () => cy.apiLogin(emailUser));
    });

    it('MM-T4045_2 Email user session should not extend even with user activity when disabled', () => {
        // # Disable ExtendSessionLengthWithActivity
        setting.ServiceSettings.ExtendSessionLengthWithActivity = false;
        cy.apiUpdateConfig(setting);

        verifyNotExtendedSession(emailUser, () => cy.apiLogin(emailUser));
    });
});
