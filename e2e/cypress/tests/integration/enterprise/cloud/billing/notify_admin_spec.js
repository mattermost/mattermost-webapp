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

        const url = setUpNotifications(subscription);
        cy.then(() => {
            triggerNotifications(url);
        });
    });
});

function setUpNotifications(subscription) {
    let myTeam;
    let myChannel;
    let myUrl;
    let myMessageLimitUsers = [];
    let myUnlimitedTeamsUsers = [];
    let myUserGroupsUsers = [];

    cy.apiInitSetup().then(({team, channel, offTopicUrl: url}) => {
        myTeam = team;
        myChannel = channel;
        myUrl = url;
        myMessageLimitUsers = createUsersProcess(myTeam, myChannel, 3);
        myUnlimitedTeamsUsers = createUsersProcess(myTeam, myChannel, 2);
        myUserGroupsUsers = createUsersProcess(myTeam, myChannel, 5);
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

    // cy.visit(myUrl);

    return myUrl;
}
