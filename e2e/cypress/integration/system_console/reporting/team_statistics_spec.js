// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System Console > Team Statistics', () => {
    before(() => {
        // # Create team.
        cy.apiCreateTeam('mmt906-team', 'mmt906-team').then(({team}) => {
            // # Create private channel.
            cy.apiCreateChannel(team.id, 'mmt906-ch', 'mmt906-ch', 'P');

            // # Visit team statistics page.
            cy.visit('/admin_console/reporting/team_statistics').wait(TIMEOUTS.TWO_SEC);

            // # Select created team.
            cy.get('select.team-statistics__team-filter__dropdown').select(team.id);
        });
    });

    it('MM-T906 Team Statistics displays expected content categories', () => {
        // * Check that the header has loaded correctly and contains the expected text.
        cy.get('.team-statistics__header span').should('be.visible').should('contain', 'Team Statistics for');

        // * Check that the rows for the table were generated.
        cy.get('.admin-console__content .row').should('have.length', 4);

        // * Check that the title content for the stats is as expected.
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(0).should('contain', 'Total Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(1).should('contain', 'Public Channels');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(2).should('contain', 'Private Channels');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(3).should('contain', 'Total Posts');
        cy.get('.admin-console__content .row').eq(1).find('.title').eq(0).should('contain', 'Total Posts');
        cy.get('.admin-console__content .row').eq(2).find('.title').eq(0).should('contain', 'Active Users With Posts');
        cy.get('.admin-console__content .row').eq(3).find('.title').eq(0).should('contain', 'Recent Active Users');
        cy.get('.admin-console__content .row').eq(3).find('.title').eq(1).should('contain', 'Newly Created Users');

        // * Check that the values for the stats are valid.
        cy.get('.admin-console__content .row').eq(0).find('.content').each((el) => {
            cy.wrap(el).eq(0).invoke('text').then(parseFloat).should('be.gt', 0);
        });

        // * Check that the generated tables are not empty.
        cy.get('.recent-active-users').find('table').eq(0).should('not.empty');
        cy.get('.recent-active-users').find('table').eq(1).should('not.empty');
    });

    it('MM-T907 - Reporting ➜ Team Statistics - teams listed in alphabetical order', () => {
        goToAdminConsole();
        cy.get('#reporting\\/team_statistics').click();
        cy.wait(TIMEOUTS.ONE_SEC);

        // * Verify Teams are listed in alphabetical order, regardless of who created the team
        cy.findByTestId('teamFilter').then((el) => {
            // # Get the options and append them to a unsorted array (assume unsorted)
            const unsortedOptionsText = [];
            el[0].childNodes.forEach((child) => unsortedOptionsText.push(child.innerText));

            // # Make a copy of the above array and then we sort them
            const sortedOptionsText = [...unsortedOptionsText].sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

            // * Compare the unsorted array and sorted array and if it initially was sorted, these should match
            for (let i = 0; i < unsortedOptionsText.length; i++) {
                expect(unsortedOptionsText[i]).equal(sortedOptionsText[i]);
            }
        });
    });
});
