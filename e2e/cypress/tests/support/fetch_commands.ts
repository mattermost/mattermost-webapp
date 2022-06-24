// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export {};

Cypress.Commands.add('delayRequestToRoutes', (routes = [], delay = 0) => {
    cy.on('window:before:load', (win) => addDelay(win, routes, delay));
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const addDelay = (win: typeof window, routes: any[], delay: number) => {
    const fetch = win.fetch;
    cy.stub(win, 'fetch').callsFake((...args: any) => {
        for (let i = 0; i < routes.length; i++) {
            if (args[0].includes(routes[i])) {
                return wait(delay).then(() => (fetch as any)(...args));
            }
        }

        return (fetch as any)(...args);
    });
};

// Websocket list to use with mockWebsockets
window.mockWebsockets = [];

// Wrap websocket to be able to connect and close connections on demand
Cypress.Commands.add('mockWebsockets', () => {
    cy.on('window:before:load', (win) => mockWebsockets(win));
});

const mockWebsockets = (win: typeof window = window) => {
    const RealWebSocket: any = WebSocket;
    cy.stub(win, 'WebSocket').callsFake((...args) => {
        const mockWebSocket = {
            wrappedSocket: null,
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
            send(data: any) {
                if (this.wrappedSocket) {
                    this.wrappedSocket.send(data);
                } else {
                    onerror('');
                }
            },
            close() {
                if (this.wrappedSocket) {
                    this.wrappedSocket.close(1000);
                }
            },
            connect() {
                this.wrappedSocket = new RealWebSocket(...args);
                this.wrappedSocket.onopen = this.onopen;
                this.wrappedSocket.onmessage = this.onmessage;
                this.wrappedSocket.onerror = this.onerror;
                this.wrappedSocket.onclose = this.onclose;
            },
        };
        window.mockWebsockets.push(mockWebSocket);
        return mockWebSocket;
    });
};

declare global {
    interface Window {
        mockWebsockets: any[];
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Mocks websockets before window load
             *
             * @example
             *   cy.mockWebsockets();
             */
            mockWebsockets: typeof mockWebsockets;
        }
    }
}
