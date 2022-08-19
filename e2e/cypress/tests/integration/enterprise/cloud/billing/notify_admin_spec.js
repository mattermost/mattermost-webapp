// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Move to utils
function simulateSubscription(subscription, withLimits = true) {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: subscription,
    });

    cy.intercept('GET', '**/api/v4/cloud/products**', {
        statusCode: 200,
        body: [
            {
                id: 'prod_1',
                sku: 'cloud-starter',
                price_per_seat: 0,
                name: 'Cloud Starter',
            },
            {
                id: 'prod_2',
                sku: 'cloud-professional',
                price_per_seat: 10,
                name: 'Cloud Professional',
            },
            {
                id: 'prod_3',
                sku: 'cloud-enterprise',
                price_per_seat: 30,
                name: 'Cloud Enterprise',
            },
        ],
    });

    if (withLimits) {
        cy.intercept('GET', '**/api/v4/cloud/limits', {
            statusCode: 200,
            body: {
                messages: {
                    history: 10000,
                },
            },
        });
    }
}

function userNotificationProcess(subscription, team, channel) {
    simulateSubscription(subscription);

    const users = [];

    var times = 2;
    for (var i = 0; i < times; i++) {
        cy.apiCreateUser({prefix: 'other'}).then(({user}) => {
            users.push(user);
            cy.apiAddUserToTeam(team.id, user.id).then(() => {
                cy.apiAddUserToChannel(channel.id, user.id);
            });

            proo(subscription, user, team, channel);
        });
    }

    return users;
}

function proo(subscription, user, team, channel) {
    simulateSubscription(subscription);
    cy.apiLogin(user);
    cy.visit(`/${team.name}/channels/${channel.name}`);

    cy.get('#product_switch_menu').click().then((() => {
        cy.get('#Custom-User-groups-restricted-indicator').click();
    }));

    cy.get('#FeatureRestrictedModal').should('exist');

    cy.get('#button-plans').click();
}

function triggerNotifications(url) {
    cy.apiAdminLogin().then(() => {
        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'POST',
            url: '/api/v4/cloud/trigger-notify-admin-posts',
            body: {},
        });
    });
    cy.visit(url);
}

describe('Notify Admin', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    it('should', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
            userNotificationProcess(subscription, team, channel);
            triggerNotifications(url);
        });
    });
});
