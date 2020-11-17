// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @outgoing_webhook
/* eslint-disable max-lines */

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {enableUsernameAndIconOverrideInt, enableUsernameAndIconOverride} from '../incoming_webhook/helpers';

describe('Outgoing webhook', () => {
    let sysadmin;
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;
    let siteName;

    const triggerWord = 'text';
    const triggerWordExpanded = 'text with some more text';
    const callbackUrl = `${Cypress.env().webhookBaseUrl}/post_outgoing_webhook`;
    const defaultUserName = 'sysadmin';
    const noChannelSelectionOption = '--- Select a channel ---';
    const webhookIconUrlOverride = 'http://via.placeholder.com/150/00F/888';
    let webhookUserNameOverride = 'webhook';
    let webhookUserIconOverride = 'webhook_icon.jpg';

    before(() => {
        cy.apiGetConfig().then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });
        cy.apiGetMe().then(({user}) => {
            sysadmin = user;
        });
        cy.requireWebhookServer();
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnablePostUsernameOverride: false,
                EnablePostIconOverride: false,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;
        });

        cy.apiCreateUser().then(({user: user1}) => {
            otherUser = user1;
            cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        });
    });

    it('MM-T584 default username and profile pic Trigger = posting anything in the specified channel', () => {
        // # Enable user name and icon overrides
        cy.apiAdminLogin();
        enableUsernameAndIconOverride(true);

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#channelSelect').select(testChannel.display_name);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in the channel by user1
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the user name is overriden
            cy.get('.post__header').find('.user-popover').should('have.text', webhookUserNameOverride);

            // * Verify that the user icon is overriden
            cy.fixture(webhookUserIconOverride).then((overrideImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });

        // # Post a message in the channel by user2
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the user name is overriden
            cy.get('.post__header').find('.user-popover').should('have.text', webhookUserNameOverride);

            // * Verify that the user icon is overriden
            cy.fixture(webhookUserIconOverride).then((overrideImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });
    });

    it('MM-T2035 default username and overridden profile pic (using command) Trigger = posting a trigger word in any channel', () => {
        webhookUserIconOverride = 'webhook_override_icon.png';

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#channelSelect').select(testChannel.display_name);
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Enable user icon override only
        cy.apiAdminLogin();
        enableUsernameAndIconOverrideInt(false, true);

        // # Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * click "Outgoing Webhooks"
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * click "Edit"
        cy.get('.item-actions > a > span').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/edit`);

        // # Change the profile pic for the outgoing webhook
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#iconURL').scrollIntoView().type(webhookIconUrlOverride);
            cy.get('#channelSelect').select(noChannelSelectionOption);
            cy.get('#saveWebhook').click();
        });

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in a channel
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the user name is the default one
            cy.get('.post__header').find('.user-popover').should('have.text', defaultUserName);

            // * Verify that the user icon is overriden
            cy.fixture(webhookUserIconOverride).then((overrideImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });
    });

    it('MM-T2036 overridden username and profile pic (using Mattermost UI)', () => {
        webhookUserNameOverride = 'override';
        webhookUserIconOverride = 'webhook_override_icon.png';

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Enable user name and icon overrides
        cy.apiAdminLogin();
        enableUsernameAndIconOverride(true);

        // # Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * click "Outgoing Webhooks"
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * click "Edit"
        cy.get('.item-actions > a > span').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/edit`);

        // # Change the user name and icon for the outgoing webhook
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#username').type(webhookUserNameOverride);
            cy.get('#iconURL').scrollIntoView().type(webhookIconUrlOverride);
            cy.get('#saveWebhook').click();
        });

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in a channel
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the user name is overriden
            cy.get('.post__header').find('.user-popover').should('have.text', webhookUserNameOverride);

            // * Verify that the user profile icon is overriden
            cy.fixture(webhookUserIconOverride).then((overrideImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.eq(overrideImage);
                });
            });
        });
    });

    it('MM-T2037 Outgoing Webhooks - overridden username and profile pic from webhook', () => {
        const webhookUsernameFromWebhook = 'user_from_webhook';
        const newCallbackUrl = callbackUrl + '?override_username=' + webhookUsernameFromWebhook + '&override_icon_url=' + webhookIconUrlOverride;

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Enable user name and icon overrides
        cy.apiAdminLogin();
        enableUsernameAndIconOverride(true);

        // # Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * click "Outgoing Webhooks"
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * click "Edit"
        cy.get('.item-actions > a > span').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/edit`);

        // # Update the callback url for the outgoing webhook
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#callbackUrls').clear().type(newCallbackUrl);
            cy.get('#saveWebhook').click();
        }).then(() => {
            cy.get('#confirmModalButton').should('be.visible').click();
        });

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in a channel by user1
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the username is the one from the override_username param
            cy.get('.post__header').find('.user-popover').should('have.text', webhookUsernameFromWebhook);

            // * Verify that the user profile icon is the one from the override_icon_url param
            cy.fixture(webhookUserIconOverride).then((overrideImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body.substring(0, 50)).to.eq(overrideImage.substring(0, 50));
                });
            });
        });

        // # Post a message in a channel by user2
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the user name is the one from the override_username param
            cy.get('.post__header').find('.user-popover').should('have.text', webhookUsernameFromWebhook);

            // * Verify that the user icon is the one from the override_username param
            cy.fixture(webhookUserIconOverride).then((defaultImage) => {
                cy.get('.profile-icon > img').invoke('attr', 'src').then((url) => cy.request({url, encoding: 'base64'})).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body.substring(0, 50)).to.eq(defaultImage.substring(0, 50));
                });
            });
        });
    });

    it('MM-T2038 Bot posts as a comment/reply', () => {
        const newCallbackUrl = callbackUrl + '?response_type=comment';

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * click "Outgoing Webhooks"
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * click "Edit"
        cy.get('.item-actions > a > span').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/edit`);

        // # Change the profile pic for the outgoing webhook
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#callbackUrls').clear().type(newCallbackUrl);
            cy.get('#saveWebhook').click();
        }).then(() => {
            cy.get('#confirmModalButton').should('be.visible').click();
        });

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in a channel by user1
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().should('contain', 'comment');
    });

    it('MM-T2039 Outgoing Webhooks - Reply to bot post', () => {
        const secondMessage = 'some text';

        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message in a channel by user1
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');
        cy.postMessage(secondMessage);

        // # Post a reply on RHS to the webhook post
        cy.getNthPostId(-2).then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            cy.postMessageReplyInRHS('A reply to the webhook post');
            cy.wait(TIMEOUTS.HALF_SEC);

            cy.getLastPost().within(() => {
                cy.findByTestId('post-link').should('be.visible').and('contains.text', 'Commented on ' + sysadmin.username + '\'s message: #### Outgoing Webhook Payload');
            });
        });
    });

    it('MM-T2040 Disable overriding username and profile pic in System Console', () => {
        // # Define outgoing webhook
        // * Go to test team/channel, open main menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/${testChannel.name}`);
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
        cy.get('.Menu__content').should('be.visible').findByText('Integrations').click();

        // * Verify that it redirects to integrations URL. Then, click "Outgoing Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Outgoing Webhooks').click();

        // * Verify that it redirects to outgoing webhooks URL. Then, click "Add Outgoing Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findByText('Add Outgoing Webhook').click();

        // * Verify that it redirects to where it can add outgoing webhook
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#triggerWords').type(triggerWord);
            cy.get('#callbackUrls').type(callbackUrl);
            cy.findByText('Save').scrollIntoView().should('be.visible').click();
        });

        // # Click "Done" and verify that it redirects to incoming webhooks URL
        cy.findByText('Done').click();
        cy.url().should('include', `${testTeam.name}/integrations/outgoing_webhooks`);

        // # Click back to site name and verify that it redirects to test team/channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `${testTeam.name}/channels/${testChannel.name}`);

        cy.apiAdminLogin();

        // # Enable user name and icon overrides
        enableUsernameAndIconOverride(true);

        // # Disable user name and icon overrides
        enableUsernameAndIconOverride(false);

        // # Post a message in a channel
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.postMessage(triggerWordExpanded);
        cy.uiWaitUntilMessagePostedIncludes(triggerWord);
        cy.uiWaitUntilMessagePostedIncludes('#### Outgoing Webhook Payload');

        cy.getLastPost().within(() => {
            // * Verify that the username shown is of the webhook creator and override is not allowed.
            cy.get('.post__header').find('.user-popover').should('have.text', sysadmin.username);

            // * Verify that the user icon shown is of the webhook creator and override is not allowed.
            cy.get('.profile-icon > img').should('have.attr', 'src', `${Cypress.config('baseUrl')}/api/v4/users/${sysadmin.id}/image?_=0`);
        });
    });
});
