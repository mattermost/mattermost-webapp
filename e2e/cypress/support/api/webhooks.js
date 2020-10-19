// *****************************************************************************
// Webhooks
// https://api.mattermost.com/#tag/webhooks
// *****************************************************************************

Cypress.Commands.add('apiCreateOutgoingWebhook', (hook = {}, isIncoming = true) => {
    const hookUrl = isIncoming ? '/api/v4/hooks/incoming' : '/api/v4/hooks/outgoing';
    const options = {
        url: hookUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        body: hook,
    };

    return cy.request(options).then((response) => {
        const data = response.body;
        return {...data, url: isIncoming ? `${Cypress.config().baseUrl}/hooks/${data.id}` : ''};
    });
});

Cypress.Commands.add('apiGetOutgoingWebhook', (hookId, isIncoming = true) => {
    const hookUrl = isIncoming ? `/api/v4/hooks/incoming/${hookId}` : `/api/v4/hooks/outgoing/${hookId}`;
    const options = {
        url: hookUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'GET',
        failOnStatusCode: false,
    };

    return cy.request(options).then((response) => {
        return cy.wrap(response);
    });
});