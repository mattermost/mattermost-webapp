// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiCloseAnnouncementBar() {
    cy.document().then((doc) => {
        const announcementBar = doc.getElementsByClassName('announcement-bar')[0];
        if (announcementBar) {
            cy.get('.announcement-bar__close').click();
        }
    });
}
Cypress.Commands.add('uiCloseAnnouncementBar', uiCloseAnnouncementBar);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Close the announcement bar if shown in the UI
             *
             * @example
             *   cy.uiCloseAnnouncementBar();
             */
            uiCloseAnnouncementBar(): ChainableT<void>;
        }
    }
}
