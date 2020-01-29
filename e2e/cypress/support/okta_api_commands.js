// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

Cypress.Commands.add('oktaGetApp', () => {
    return cy.request({
        method: 'GET',
        url: Cypress.env("okta_api_url") + "/apps/" + Cypress.env("okta_mm_app_instance_id"),
        headers: {
            Authorization: "SSWS " + Cypress.env("okta_mm_app_token"),
        }
    }).then(response => {
        expect(response.status).to.be.equal(200);
        console.log('oktaGetApp ' + response.body);
        return response.body;
    });
});

Cypress.Commands.add('oktaGetAppMetadata', () => {
    return cy.request({
        method: 'GET',
        url: Cypress.env("okta_api_url") +  "/apps/" + Cypress.env("okta_mm_app_instance_id") + "/sso/saml/metadata",
        headers: {
            Authorization: "SSWS " + Cypress.env("okta_mm_app_token"),
        }
    }).then(response => {
        expect(response.status).to.be.equal(200);
        console.log('oktaGetAppMetadata ' + response.body);
        return response.body;
    });
});

Cypress.Commands.add('oktaUpdateAppSettings', (appSettingsJson) => {
    return cy.request({
        method: 'PUT',
        url: Cypress.env("okta_api_url") + "/apps/" + Cypress.env("okta_mm_app_instance_id"),
        headers: {
            Authorization: "SSWS " + Cypress.env("okta_mm_app_token"),
        },
        body: appSettingsJson
    }).then(response => {
        expect(response.status).to.equal(200);
        console.log('oktaUpdateAppSettings ' + response.body);
        return response.body;
    });
});

function buildProfile(user) {
    const profile = {
        firstName: user.firstname === null ? undefined : user.firstname,
        lastName: user.lastname === null ? undefined : user.lastname,
        email: user.email === null ? undefined : user.email,
        login: user.email === null ? undefined : user.email,
        userType: user.userType === null ? undefined : user.userType,
        isguest: user.IsGuest === false ? undefined : user.IsGuest,
        isadmin: user.IsAdmin === false ? undefined : user.IsAdmin,
    };
    return profile;
}

Cypress.Commands.add('oktaCreateUser', (user = {}) => {
    let profile = buildProfile(user);
    return cy.request({
        method: 'POST',
        url: Cypress.env('okta_api_url') + "/users",
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        },
        body: {
            profile,
            credentials: {
                password : { value: user.password },
                recovery_question: {
                    question: 'What is the best open source messaging platform for developers?',
                    answer: 'Mattermost'
                }
            }
        }
    }).then(response => {
        expect(response.status).to.equal(200);
        console.log('oktaCreateUser ' + response.body);
        const userId = response.body.id;
        return userId;
    });
});

Cypress.Commands.add('oktaGetUser', (userId = '') => {
    return cy.request({
        method: 'GET',
        url: Cypress.env('okta_api_url') + "/users?q=" + userId,
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        },
        failOnStatusCode: false
    }).then(response => {
        expect(response.status).to.be.equal(200);
        console.log('oktaGetUser ' + response.body);
        if(response.body.length > 0){
            const userId = response.body[0].id;
            return userId;
        }
        return null;
    });
});

Cypress.Commands.add('oktaUpdateUser', (userId = '', user = {}) => {
    let profile = buildProfile(user);
    cy.request({
        method: 'POST',
        url: Cypress.env('okta_api_url') + "/users/" + userId,
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        },
        body: {
            profile
        }
    }).then((response) => {
        expect(response.status).to.equal(201);
        console.log('oktaUpdateUser ' + response);
        return cy.wrap(response);
        //expect(response.body).is.empty;
    });
});

//first we deactivate the user, then we actually delete it
Cypress.Commands.add('oktaDeleteUser', (userId = '') => {
    cy.request({
        method: 'DELETE',
        url: Cypress.env('okta_api_url') + "/users/" + userId,
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        }
    }).then((response) => {
        expect(response.status).to.equal(204);
        console.log('oktaDeleteUser(1) ' + userId);
        expect(response.body).is.empty;
        cy.request({
            method: 'DELETE',
            url: Cypress.env('okta_api_url') + "/users/" + userId,
            headers: {
                Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
            }
        }).then((response) => {
            expect(response.status).to.equal(204);
            console.log('oktaDeleteUser(2) ' + response.body);
            expect(response.body).is.empty;
        });
    });
});

Cypress.Commands.add('oktaDeleteSession', (userId = '') => {
    cy.request({
        method: 'DELETE',
        url: Cypress.env('okta_api_url') + "/users/" + userId + '/sessions',
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        }
    }).then((response) => {
        expect(response.status).to.equal(204);
        console.log('oktaDeleteSession ' + response.body);
        expect(response.body).is.empty;
    });
});

Cypress.Commands.add('oktaAssignUserToApplication', (userId = '', user = {}) => {
    let profile = buildProfile(user);
    cy.request({
        method: 'POST',
        url: Cypress.env('okta_api_url') + "/apps/" + Cypress.env("okta_mm_app_instance_id") + "/users",
        headers: {
            Authorization: "SSWS " + Cypress.env('okta_mm_app_token'),
        },
        body: {
            id: userId,
            scope: 'USER',
            profile: {
               firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        }
    }).then((response) => {
        expect(response.status).to.be.equal(200);
        console.log('oktaAssignUserToApplication ' + response.body);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('doOktaLogin', (user) => {
    cy.get('body').then((body) => {
        if (body.find('channelView').length) {
            cy.get("#okta-sign-in").should('be.visible');
            cy.get('#okta-signin-username').should('be.visible').type(user.email);
            cy.get('#okta-signin-password').should('be.visible').type(user.password);
            cy.get('#okta-signin-submit').should('be.visible').click().wait(TIMEOUTS.SMALL);
        }
});
