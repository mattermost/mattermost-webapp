// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console
import * as TIMEOUTS from '../../fixtures/timeouts';


// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('Main menu', () => {    
    // it('MM-T897 - Focus should be in System Console search box on opening System Console or refreshing pages in System Console', () => {
    //     goToAdminConsole();
    //     // * Assert the ID of the element is the ID of admin sidebar filter
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    //     cy.wait(TIMEOUTS.ONE_SEC)

    //     // # Go to another page
    //     cy.get('#reporting\\/system_analytics').click();
        
    //     // * Ensure focus is lost
    //     cy.focused().should('not.have.id', 'adminSidebarFilter');

    //     // *Reload and ensure the focus is back on the search componenet
    //     cy.reload();
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    //     cy.wait(TIMEOUTS.ONE_SEC)

    //     // ------------

    //     // # Go to another page
    //     cy.findByTestId('reporting.team_statistics').click();
        
    //     // * Ensure focus is lost
    //     cy.focused().should('not.have.id', 'adminSidebarFilter');

    //     // *Reload and ensure the focus is back on the search componenet
    //     cy.reload();
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    //     cy.wait(TIMEOUTS.ONE_SEC)
        
    //     // ------------

    //     // # Go to another page
    //     cy.get('#reporting\\/server_logs').click();

    //     // * Ensure focus is lost
    //     cy.focused().should('not.have.id', 'adminSidebarFilter');

    //     // *Reload and ensure the focus is back on the search componenet
    //     cy.reload();
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    //     cy.wait(TIMEOUTS.ONE_SEC)
    //     // ------------

    //     // # Go to another page
    //     cy.get('#user_management\\/users').click();
        
    //     // * Ensure focus is lost
    //     cy.focused().should('not.have.id', 'adminSidebarFilter');

    //     // *Reload and ensure the focus is back on the search componenet
    //     cy.reload();
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    //     cy.wait(TIMEOUTS.ONE_SEC)
    //     // ------------

    //     // # Go to another page
    //     cy.get('#user_management\\/teams').click();

    //     // * Ensure focus is lost
    //     cy.focused().should('not.have.id', 'adminSidebarFilter');

    //     // *Reload and ensure the focus is back on the search componenet
    //     cy.reload();
    //     cy.focused().should('have.id', 'adminSidebarFilter');
    // });

    // it('MM-T897 - System Console menu footer should not cut off at the bottom', () => {
    //     goToAdminConsole();

    //     // * Scroll to it and ensure it can be clicked
    //     cy.findByTestId('experimental.bleve').scrollIntoView().click();
    // });

    // it('MM-T898 - Individual plugins can be searched for via the System Console search box', () => {
    //     goToAdminConsole();

    //     // # Type first plugin name
    //     cy.get('#adminSidebarFilter').type('Anti');
    //     cy.wait(TIMEOUTS.ONE_SEC);

    //     // * ENsure anti virus plugin is highlighted
    //     cy.get('#plugins\\/plugin_antivirus').then((el) => {
    //         expect(el[0].innerHTML).includes("markjs")
    //     });


    //     // # Type first plugin name
    //     cy.get('#adminSidebarFilter').clear().type('Auto');
    //     cy.wait(TIMEOUTS.ONE_SEC);

    //     // * ENsure autolink plugin is highlighted
    //     cy.get('#plugins\\/plugin_mattermost-autolink').then((el) => {
    //         expect(el[0].innerHTML).includes("markjs")
    //     });


    //     // # Type first plugin name
    //     cy.get('#adminSidebarFilter').clear().type('AWS SN');
    //     cy.wait(TIMEOUTS.ONE_SEC);

    //     // * ENsure aws sns plugin is highlighted
    //     cy.get('#plugins\\/plugin_com\\.mattermost\\.aws-sns').then((el) => {
    //         expect(el[0].innerHTML).includes("markjs")
    //     });
    // });

    // it('MM-T1634 - Search box should remain visible / in the header as you scroll down the settings list in the left-hand-side', () => {
    //     goToAdminConsole();
        
    //     // * Scroll to bottom of left hand side
    //     cy.findByTestId('experimental.bleve').scrollIntoView().click();

    //     // * To check if the sidebar is in view, try to click it
    //     cy.get('#adminSidebarFilter').click();
    // });

    // it('MM-T899 - Edition and License: Verify Privacy Policy link points to correct URL', () => {
    //     goToAdminConsole();
        
    //     // * Find privacy link and then assert that the href is what we expect it to be
    //     cy.findByTestId('privacyPolicyLink').then((el) => {
    //         expect(el[0].href).equal('https://about.mattermost.com/default-privacy-policy/');
    //     })
    // });

    // it('MM-T902 - Reporting ➜ Site statistics line graphs show same date', () => {
    //     goToAdminConsole();
        
    //     // * Find site stastics and click it
    //     cy.findByTestId('reporting.system_analytics').click();

    //     let totalPostsDataSet;
    //     let totalPostsFromBots;
    //     let activeUsersWithPosts;

    //     // # Grab all data from the 3 charts from there data labels
    //     cy.findByTestId('totalPosts').then((el) => {
    //         totalPostsDataSet = el[0].dataset.labels;            
    //         cy.findByTestId('totalPostsFromBots').then((el) => {
    //             totalPostsFromBots = el[0].dataset.labels;
    //             cy.findByTestId('activeUsersWithPosts').then((el) => {
    //                 activeUsersWithPosts = el[0].dataset.labels;

    //                 // * Assert that all the dates are the same
    //                 expect(totalPostsDataSet).equal(totalPostsFromBots);
    //                 expect(totalPostsDataSet).equal(activeUsersWithPosts)
    //                 expect(totalPostsFromBots).equal(activeUsersWithPosts)

    //             });
    //         });
    //     });
    // });

    it('MM-T907 - Reporting ➜ Team Statistics - teams listed in alphabetical order', () => {
        goToAdminConsole();
        
    });
 
});

