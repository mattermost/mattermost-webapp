// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @status

import {openCustomStatusModal} from './helper';

describe('DND Status - Setting Your Own DND Status', () => {
    before(() => {
        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('should open up ', () => {
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Click the "Do Not Disturb" menu item
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-dnd_menuitem').click();
        cy.get('.MenuWrapper .SubMenuItemContainer li#dndTime-5-Custom_menuitem').click();
        cy.get('#dndCustomTimePickerModal').should('exist');

        // # Open the custom status modal
        // openCustomStatusModal();

        // * Default emoji is currently visible in the custom status input
        // cy.get('#custom_status_modal .StatusModal__emoji-button span').should('have.class', 'icon--emoji');

        // // # Type the status text in the input
        // cy.get('#custom_status_modal .StatusModal__input input').type(customStatus.text);

        // // * Speech balloon emoji should now be visible in the custom status input
        // cy.get('#custom_status_modal .StatusModal__emoji-button span').invoke('attr', 'data-emoticon').should('contain', 'speech_balloon');
    });
});
