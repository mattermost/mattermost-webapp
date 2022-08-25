// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Move to utils
function simulateSubscription(subscription, withLimits = {}) {
    cy.intercept('GET', '**/api/v4/cloud/subscription', {
        statusCode: 200,
        body: subscription,
    }).as('subscription');

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
    }).as('products');

    if (withLimits) {
        cy.intercept('GET', '**/api/v4/cloud/limits', {
            statusCode: 200,
            body: withLimits,
        });
    }
}

function createUsersProcess(team, channel, times) {
    const users = [];
    for (var i = 0; i < times; i++) {
        cy.apiCreateUser({prefix: 'other'}).then(({user}) => {
            users.push(user);
            cy.apiAddUserToTeam(team.id, user.id).then(() => {
                cy.apiAddUserToChannel(channel.id, user.id);
            });
        });
    }

    return users;
}

function userGroupsNotification() {
    cy.get('#product_switch_menu').click().then((() => {
        cy.get('#Custom-User-groups-restricted-indicator').click();
    }));

    cy.get('#FeatureRestrictedModal').should('exist');

    cy.get('#button-plans').click();

    cy.get('.close').click();
}

function creatNewTeamNotification() {
    cy.get('.test-team-header').click().then(() => {
        cy.get('#Create-Multiple-Teams-restricted-indicator').click();
    });

    cy.get('#FeatureRestrictedModal').should('exist');

    cy.get('#button-plans').click();

    cy.get('.close').click();
}

function createMessageLimitNotification() {
    cy.get('#product_switch_menu').click();
    cy.get('#Custom-User-groups-restricted-indicator > i').click();
    cy.findAllByRole('button', { name: 'Notify admin' }).should('be.visible').click()
    cy.findAllByRole('button', { name: 'Notified!' }).should('be.visible').click()
    cy.findAllByRole('button', { name: 'Already notified!' }).should('be.visible').click()
}

function createTrialNotificationForProfessionalFeatures() {
    // createMessageLimitNotification()
    cy.get('#product_switch_menu').click().then((() => {
        cy.get('#view_plans_cta').click();
        cy.get('#pricingModal').get('#professional').within(() => {
            cy.get('#notify_admin_cta').click();
        });
        cy.get('#closeIcon').click();
    }));
}

function createTrialNotificationForEnterpriseFeatures() {
    // createMessageLimitNotification()
    cy.get('#product_switch_menu').click().then((() => {
        cy.get('#view_plans_cta').click();
        cy.pause();
        cy.get('#pricingModal').get('#enterprise').within(() => {
            cy.get('#notify_admin_cta').click();
        });
        cy.get('#closeIcon').click();
    }));
}

function triggerNotifications(url, trial = false) {
    cy.apiAdminLogin().then(() => {
        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'POST',
            url: '/api/v4/cloud/trigger-notify-admin-posts',
            failOnStatusCode: false,
            body: {
                trial_notification: trial,
            },
        });
    });
    cy.visit(url);
}

function assertNotification(featureName, minimumPlan, totalRequests, requestsCount, teamName, trial = false) {
    // # Open system-bot and admin DM
    cy.visit(`/${teamName}/messages/@system-bot`);

    // * Check for the post from the system-bot
    cy.getLastPostId().then((postId) => {
        if (trial) {
            cy.get(`#${postId}_message`).then(() => {
                cy.get('a').contains('Enterprise trial');
            });
        } else {
            cy.get(`#${postId}_message`).contains(`${totalRequests} members of the workspace have requested a workspace upgrade for:`);
        }

        cy.get(`#${featureName}-title`.replaceAll(' ', '-')).contains(featureName);

        if (requestsCount >= 5) {
            cy.get(`#${featureName}-subtitle`.replaceAll(' ', '-')).contains(`${requestsCount} members requested access to this feature`);
            cy.get(`#${postId}_at_sum_of_members_mention`).click().then(() => {
                cy.get('#notificationFromMembersModal');
                cy.get('#invitation_modal_title').contains(`Members that requested ${featureName}`).then(() => {
                    cy.get('#closeIcon').click();
                });
            });
        }

        if (minimumPlan === 'Professional plan') {
            cy.get(`#${featureName}-title`.replaceAll(' ', '-')).within(() => {
                cy.get('#at_plan_mention').click();
            });

            cy.get('.PurchaseModal').should('exist').then(() => {
                cy.get('.close-x').click();
            });
        }
    });
}

function assertUpgradeMessageButton(onlyProfessionalFeatures) {
    cy.get('#view_upgrade_options').contains('View upgrade options');
    cy.get('#view_upgrade_options').click();
    cy.get('#pricingModal').should('exist');

    if (onlyProfessionalFeatures) {
        cy.get('.close-x').click();
        cy.get('#upgrade_to_professional').contains('Upgrade to Professional');
        cy.get('.PurchaseModal').should('exist');
    }
}

function assertTrialMessageButton() {
    cy.get('#learn_more_about_trial').contains('Learn more about trial');
    cy.get('#learn_more_about_trial').click();
    cy.get('.LearnMoreTrialModal').should('exist').then(() => {
        cy.get('.close').click();
    });

    cy.get('#view_upgrade_options').contains('View upgrade options');
    cy.get('#view_upgrade_options').click();
    cy.get('#pricingModal').should('exist');
}

function testTrialNotifications(subscription, limits) {
    let myTeam;
    let myChannel;
    let myUrl;
    let myAllProfessionalUsers = [];
    let myAllEnterpriseUsers = [];
    const ALL_PROFESSIONAL_FEATURES_REQUESTS = 5;
    const ALL_ENTERPRISE_FEATURES_REQUESTS = 3;
    const TOTAL = 8;

    // # Login as an admin and create test users that will click the different notification ctas
    cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
        myTeam = team;
        myChannel = channel;
        myUrl = url;

        // # Create non admin users
        myAllProfessionalUsers = createUsersProcess(myTeam, myChannel, ALL_PROFESSIONAL_FEATURES_REQUESTS);
        myAllEnterpriseUsers = createUsersProcess(myTeam, myChannel, ALL_ENTERPRISE_FEATURES_REQUESTS);
    });

    // # Click notify admin to trial on pricing modal
    cy.then(() => {
        myAllProfessionalUsers.forEach((user) => {
            simulateSubscription(subscription, limits);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            cy.wait(['@subscription', '@products']);
            createTrialNotificationForProfessionalFeatures();
        });
    });

    // # Click notify admin to trial on pricing modal
    cy.then(() => {
        myAllEnterpriseUsers.forEach((user) => {
            simulateSubscription(subscription, limits);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            cy.wait(['@subscription', '@products']);
            createTrialNotificationForEnterpriseFeatures();
        });
    });

    cy.then(() => {
        // # Manually trigger saved notifications
        triggerNotifications(myUrl, true);
    });

    cy.then(() => {
        assertNotification('All Professional features', 'Professional plan', TOTAL, ALL_PROFESSIONAL_FEATURES_REQUESTS, myTeam.name, true);
        assertNotification('All Enterprise features', 'Enterprise plan', TOTAL, ALL_ENTERPRISE_FEATURES_REQUESTS, myTeam.name, true);
        assertTrialMessageButton();
    });
}

function testUpgradeNotifications(subscription, limits) {
    let myTeam;
    let myChannel;
    let myUrl;
    let myMessageLimitUsers = [];
    let myUnlimitedTeamsUsers = [];
    let myUserGroupsUsers = [];

    const CREATE_MULTIPLE_TEAMS_USERS = 2;
    const UNLIMITED_MESSAGES_USERS = 3;
    const CUSTOM_USER_GROUPS = 5;

    // # Login as an admin and create test users that will click the different notification ctas
    cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
        myTeam = team;
        myChannel = channel;
        myUrl = url;

        // # Create non admin users
        myMessageLimitUsers = createUsersProcess(myTeam, myChannel, UNLIMITED_MESSAGES_USERS);
        myUnlimitedTeamsUsers = createUsersProcess(myTeam, myChannel, CREATE_MULTIPLE_TEAMS_USERS);
        myUserGroupsUsers = createUsersProcess(myTeam, myChannel, CUSTOM_USER_GROUPS);
    });

    // # Click notify admin on message limit reached
    cy.then(() => {
        myMessageLimitUsers.forEach((user) => {
            cy.clearCookies();
            simulateSubscription(subscription, limits);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            cy.wait(['@subscription', '@products']);
            createMessageLimitNotification();
        });
    });

    // # Click notify admin on team limit reached
    cy.then(() => {
        myUnlimitedTeamsUsers.forEach((user) => {
            cy.clearCookies();
            simulateSubscription(subscription, limits);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            cy.wait(['@subscription', '@products']);
            creatNewTeamNotification();
        });
    });

    // # Click notify admin to allow user groups creation
    cy.then(() => {
        myUserGroupsUsers.forEach((user) => {
            cy.clearCookies();
            simulateSubscription(subscription, limits);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            userGroupsNotification();
        });
    });

    cy.then(() => {
        // # Manually trigger saved notifications
        triggerNotifications(myUrl);
    });

    cy.then(() => {
        assertNotification('Custom User groups', 'Enterprise plan', 10, CUSTOM_USER_GROUPS, myTeam.name);
        assertNotification('Create Multiple Teams', 'Professional plan', 10, CREATE_MULTIPLE_TEAMS_USERS, myTeam.name);
        assertNotification('Unlimited Messages', 'Professional plan', 10, UNLIMITED_MESSAGES_USERS, myTeam.name);
        assertUpgradeMessageButton();
    });
}

describe('Notify Admin', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    it('should test upgrade notifications', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        const limits = {
            messages: {
                history: 500,
            },
            teams: {
                active: 0, // no extra teams allowed to be created
                teamsLoaded: true,
            },
        };

        testUpgradeNotifications(subscription, limits);
    });

    it('should test trial notifications', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
            trial_end_at: 0, // never trialed before
        };

        const limits = {
            messages: {
                history: 7000, // test server seeded with around 4k messages
            },
            teams: {
                active: 0,
                teamsLoaded: true,
            },
        };

        testTrialNotifications(subscription, limits);
    });
});
