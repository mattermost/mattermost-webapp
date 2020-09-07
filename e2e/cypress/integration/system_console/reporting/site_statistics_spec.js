// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('System Console > Site Statistics', () => {
    before(() => {
        // # Visit site statistics page
        cy.visit('/admin_console/reporting/system_analytics').wait(TIMEOUTS.TWO_SEC);
    });

    it('MM-T904 Site Statistics displays expected content categories', () => {
        // * Check that the header has loaded correctly and contains the expected text.
        cy.get('.admin-console__header span').should('be.visible').should('contain', 'System Statistics');

        // * Check that the rows for the table were generated.
        cy.get('.admin-console__content .row').should('have.length', 4);

        // * Check that the title content for the stats is as expected.
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(0).should('contain', 'Total Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(1).should('contain', 'Total Teams');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(2).should('contain', 'Total Channels');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(3).should('contain', 'Total Posts');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(4).should('contain', 'Daily Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(5).should('contain', 'Monthly Active Users');

        // * Check that the values for the stats are valid.
        cy.get('.admin-console__content .row').eq(0).find('.content').each((el) => {
            cy.wrap(el).eq(0).invoke('text').then(parseFloat).should('be.gt', 0);
        });
    });
});
