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
                    history: 500,
                },
                teams: {
                    active: 0,
                    teamsLoaded: true,
                },
            },
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
    cy.get('#product_switch_menu').click().then((() => {
        cy.get('#notify_admin_cta').click();
    }));
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

function assertNotification(featureName, minimumPlan, requestsCount, teamName) {
    // # Open system-bot and admin DM
    cy.visit(`/${teamName}/messages/@system-bot`);

    // * Check for the post from the system-bot
    cy.getLastPostId().then((postId) => {
        cy.get(`#${postId}_message`).contains(`${10} members of the workspace have requested a workspace upgrade for:`);
        cy.get(`#${featureName}-title`.replaceAll(' ', '-')).contains(featureName);

        if (requestsCount >= 5) {
            cy.get(`#${featureName}-subtitle`.replaceAll(' ', '-')).contains(`${requestsCount} members requested access to this feature`);
            cy.get('#at_sum_of_members_mention').click().then(() => {
                cy.get('#notificationFromMembersModal');
                cy.get('#invitation_modal_title').contains(`Members that requested ${featureName}`).then(() => {
                    cy.get('#closeIcon').click();
                });
            });
        }

        if (minimumPlan === 'Professional plan') {
            cy.get('#at_plan_mention').click();
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

describe('Notify Admin', () => {
    before(() => {
        // * Check if server has license for Cloud
        cy.apiRequireLicenseForFeature('Cloud');
    });

    // it('should sent user groups notifications when user groups are restricted on starter plan', () => {
    //     const subscription = {
    //         id: 'sub_test1',
    //         product_id: 'prod_1',
    //         is_free_trial: 'false',
    //     };

    //     let myTeam;
    //     let myChannel;
    //     let myUrl;
    //     let myUsers = [];

    //     cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
    //         myTeam = team;
    //         myChannel = channel;
    //         myUrl = url;
    //         myUsers = createUsersProcess(myTeam, myChannel);
    //     });

    //     cy.then(() => {
    //         myUsers.forEach((user) => {
    //             simulateSubscription(subscription);
    //             cy.apiLogin({...user, password: 'passwd'});
    //             cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);

    //             userGroupsNotification();
    //         });

    //         triggerNotifications(myUrl);
    //     });
    // });

    // it('should sent create new team notifications when create teams are restricted on trial plan', () => {
    //     const subscription = {
    //         id: 'sub_test1',
    //         product_id: 'prod_1',
    //         is_free_trial: 'false',
    //     };

    //     let myTeam;
    //     let myChannel;
    //     let myUrl;
    //     let myUsers = [];

    //     cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
    //         myTeam = team;
    //         myChannel = channel;
    //         myUrl = url;
    //         myUsers = createUsersProcess(myTeam, myChannel);
    //     });

    //     cy.then(() => {
    //         myUsers.forEach((user) => {
    //             simulateSubscription(subscription);
    //             cy.apiLogin({...user, password: 'passwd'});
    //             cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
    //             creatNewTeamNotification();
    //         });

    //         triggerNotifications(myUrl);
    //     });
    // });

    //     it('should sent message limit notifications when messages limit is reached', () => {
    //         const subscription = {
    //             id: 'sub_test1',
    //             product_id: 'prod_1',
    //             is_free_trial: 'false',
    //         };

    //         let myTeam;
    //         let myChannel;
    //         let myUrl;
    //         let myUsers = [];

    //         cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
    //             myTeam = team;
    //             myChannel = channel;
    //             myUrl = url;
    //             myUsers = createUsersProcess(myTeam, myChannel);
    //         });

    //         cy.then(() => {
    //             myUsers.forEach((user) => {
    //                 simulateSubscription(subscription);
    //                 cy.apiLogin({...user, password: 'passwd'});
    //                 cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
    //                 createMessageLimitNotification();
    //             });

    //             // triggerNotifications(myUrl);
    //         });
    //     });
    // });

    it('should sent message limit notifications when messages limit is reached', () => {
        const subscription = {
            id: 'sub_test1',
            product_id: 'prod_1',
            is_free_trial: 'false',
        };

        testNotifications(subscription);
    });
});

function testNotifications(subscription) {
    let myTeam;
    let myChannel;
    let myUrl;
    let myMessageLimitUsers = [];
    let myUnlimitedTeamsUsers = [];
    let myUserGroupsUsers = [];

    const CREATE_MULTIPLE_TEAMS_USERS = 2;
    const UNLIMITED_MESSAGES_USERS = 3;
    const CUSTOM_USER_GROUPS = 5;

    cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
        myTeam = team;
        myChannel = channel;
        myUrl = url;

        myMessageLimitUsers = createUsersProcess(myTeam, myChannel, UNLIMITED_MESSAGES_USERS);
        myUnlimitedTeamsUsers = createUsersProcess(myTeam, myChannel, CREATE_MULTIPLE_TEAMS_USERS);
        myUserGroupsUsers = createUsersProcess(myTeam, myChannel, CUSTOM_USER_GROUPS);
    });

    cy.then(() => {
        myMessageLimitUsers.forEach((user) => {
            simulateSubscription(subscription);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            createMessageLimitNotification();
        });
    });

    cy.then(() => {
        myUnlimitedTeamsUsers.forEach((user) => {
            simulateSubscription(subscription);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            creatNewTeamNotification();
        });
    });

    cy.then(() => {
        myUserGroupsUsers.forEach((user) => {
            simulateSubscription(subscription);
            cy.apiLogin({...user, password: 'passwd'});
            cy.visit(`/${myTeam.name}/channels/${myChannel.name}`);
            userGroupsNotification();
        });
    });

    cy.then(() => {
        triggerNotifications(myUrl);
    });

    cy.then(() => {
        assertNotification('Custom User groups', 'Enterprise plan', CUSTOM_USER_GROUPS, myTeam.name);
        assertNotification('Create Multiple Teams', 'Professional plan', CREATE_MULTIPLE_TEAMS_USERS, myTeam.name);
        assertNotification('Unlimited Messages', 'Professional plan', UNLIMITED_MESSAGES_USERS, myTeam.name);
        assertUpgradeMessageButton();
    });
}
