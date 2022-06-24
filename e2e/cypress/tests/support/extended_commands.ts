// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

import {ChainableT} from './api/types';

function reload(originalFn: any, forceReload: boolean, options: Record<string, any>, duration = TIMEOUTS.THREE_SEC): ChainableT<any> {
    originalFn(forceReload, options);
    return cy.wait(duration);
}

Cypress.Commands.overwrite('reload', reload);

function visit(originalFn: any, url: string, options: Record<string, any>, duration = TIMEOUTS.THREE_SEC): ChainableT<any> {
    originalFn(url, options);
    return cy.wait(duration);
}

Cypress.Commands.overwrite('visit', visit);

// TODO: Can we delete this? Are we overwriting with a compatible API? its conflicing,
// so compiler errors if we try to declare again
// declare global {
//     // eslint-disable-next-line @typescript-eslint/no-namespace
//     namespace Cypress {
//         interface Chainable {
//
//             /**
//              * Reload the page, same as cy.reload but extended with explicit wait to allow page to load freely
//              * @param forceReload — Whether to reload the current page without using the cache. true forces the reload without cache.
//              * @param options — Pass in an options object to change the default behavior of cy.reload()
//              * @param duration — wait duration with 3 seconds by default
//              *
//              * @example
//              *   cy.reload();
//              */
//             // reload: tyepof reload(forceReload: boolean, options?: Partial<Loggable & Timeoutable>, duration?: number): Chainable;
//
//             /**
//              * Visit the given url, same as cy.visit but extended with explicit wait to allow page to load freely
//              * @param url — The URL to visit. If relative uses baseUrl
//              * @param options — Pass in an options object to change the default behavior of cy.visit()
//              * @param duration — wait duration with 3 seconds by default
//              *
//              * @example
//              *   cy.visit('url');
//              */
//             // visit(url: string, options?: Partial<Cypress.VisitOptions>, duration?: number): Chainable;
//         }
//     }
// }
