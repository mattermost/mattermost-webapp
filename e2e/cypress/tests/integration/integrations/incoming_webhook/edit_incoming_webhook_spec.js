// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @incoming_webhook

import { enableUsernameAndIconOverride } from './helpers';

describe('Incoming webhook', () => {
    let testTeam;
    let siteName;

    before(() => {
        cy.apiGetConfig().then(({ config }) => {
            siteName = config.TeamSettings.SiteName;
        });
        cy.apiInitSetup().then(({ team }) => {
            testTeam = team;
        });
    });

    it('MM-T641 Edit incoming webhook, webhook posts attachment', () => {
        // # Enable username and icon override at system console
        cy.apiAdminLogin();
        enableUsernameAndIconOverride(true);

        // # Go to test team/channel, open product menu and click "Integrations"
        cy.visit(`${testTeam.name}/channels/town-square`);
        cy.uiOpenProductMenu('Integrations');

        // * Verify that it redirects to integrations URL. Then, click "Incoming Webhooks"
        cy.url().should('include', `${testTeam.name}/integrations`);
        cy.get('.backstage-sidebar').should('be.visible').findByText('Incoming Webhooks').click();

        // * Verify that it redirects to incoming webhooks URL. Then, click "Add Incoming Webhook"
        cy.url().should('include', `${testTeam.name}/integrations/incoming_webhooks`);
        cy.findByText('Add Incoming Webhook').click();

        // * Verify that it redirects to where it can add incoming webhook
        cy.url().should('include', `${testTeam.name}/integrations/incoming_webhooks/add`);

        // # Enter webhook details such as title, description and channel, then save
        cy.get('.backstage-form').should('be.visible').within(() => {
            cy.get('#displayName').type('Webhook Title');
            cy.get('#description').type('Webhook Description');
            cy.get('#channelSelect').select('Town Square');
            cy.findByText('Save').scrollIntoView().click();
        });

        // * Verify that it redirects to incoming webhook confirmation URL
        cy.url().should('include', `${testTeam.name}/integrations/confirm?type=incoming_webhooks&id=`).
            invoke('toString').then((hookConfirmationUrl) => {
                const hookId = hookConfirmationUrl.split('id=')[1];
                const hookUrl = `${Cypress.config('baseUrl')}/hooks/${hookId}`;

                // * Verify that the hook ID in the URL matches with the one shown in a page
                // * Verify that the copy link is shown.
                cy.findByText(hookUrl).should('be.visible').
                    parent().siblings('.fa-copy').should('be.visible');

                // # Click "Done" and verify that it redirects to incoming webhooks URL
                cy.findByText('Done').click();
                cy.url().should('include', `${testTeam.name}/integrations/incoming_webhooks`);

                // # Click back to site name and verify that it redirects to test team/channel
                cy.findByText(`Back to ${siteName}`).click();
                cy.url().should('include', `${testTeam.name}/channels/town-square`);

                // # Post an incoming webhook and verify that it is posted in the channel
                const payload = {
                    channel: 'town-square',
                    username: 'new-username',
                    attachments: [{fallback: 'fallback text', pretext: 'Optional text that appears above the attachment block', author_name: 'Authors Name', author_link: 'http://mattermost.org', author_icon: 'http://www.mattermost.org/wp-content/uploads/2016/04/icon.png', text: 'This is the text of the attachment. It should appear just above the image. \nIts very long, so it makes the text collapse behind a \\"Show More\\" button. If you click \\"Show More\\" the text should expand, and then if you click "Show Less" it should collapse again. The rest of the attachment should include one image of a graph and one thumbnail image of the Mattermost logo on the right hand side of the attachment. It should also include additional fields below the image that are formatted more like a table, in two columns. The left border of the attachment should be colored green. At the top of the attachment, there should be an author name followed by a bolded title. Both the author name and the title should be hyperlinks.', thumb_url: 'http://www.mattermost.org/wp-content/uploads/2016/04/icon.png', title: 'Testing Integration Attachments', title_link: 'https://www.google.com', color: '#00ff00', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/ScientificGraphSpeedVsTime.svg/2000px-ScientificGraphSpeedVsTime.svg.png', fields: [{short: false, title: 'Area', value: 'Testing with a very long piece of text that will take up the whole width of the table. And then some more space even because it is really not a short field.'}, {short: true, title: 'Iteration', value: 'Testing'}, {short: true, title: 'State', value: 'New'}, {short: false, title: 'Reason', value: 'New defect reported'}]}],
                };
                cy.postIncomingWebhook({ url: hookUrl, data: payload });
                cy.get('.attachment__image').should('be.visible');
            });

        cy.getLastPost().within(() => {
            cy.get('.attachment__title-link').should('have.text', 'Testing Integration Attachments');
            cy.get('.attachment__image').should('be.visible');
            cy.get(':nth-child(2) > thead > tr > .attachment-field__caption').should('have.text', 'Area');
            cy.get(':nth-child(3) > thead > tr > :nth-child(1)').should('have.text', 'Iteration');
            cy.get('thead > tr > :nth-child(2)').should('have.text', 'State');
            cy.get(':nth-child(4) > thead > tr > .attachment-field__caption').should('have.text', 'Reason');
        });
    });
});
