// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console
import * as TIMEOUTS from '../../fixtures/timeouts';
import {
    promoteToChannelOrTeamAdmin,
} from '../enterprise/system_console/channel_moderation/helpers.js';



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

    // it('MM-T907 - Reporting ➜ Team Statistics - teams listed in alphabetical order', () => {
    //     goToAdminConsole();
    //     cy.get('#reporting\\/team_statistics').click();
    //     cy.wait(TIMEOUTS.ONE_SEC);
    //     cy.findByTestId('teamFilter').then((el) => {

    //         // # Get the options and append them to a unsorted array (assume unsorted)
    //         const unsortedOptionsText = [];
    //         el[0].childNodes.forEach((child) => unsortedOptionsText.push(child.innerText));

    //         // # Make a copy of the above array and then we sort them 
    //         const sortedOptionsText = [...unsortedOptionsText].sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

    //         // * Compare the unsorted array and sorted array and if it initially was sorted, these should match
    //         for (let i = 0; i < unsortedOptionsText.length; i++) {
    //             expect(unsortedOptionsText[i]).equal(sortedOptionsText[i]);
    //         }
    //     });
    // });


    // it('MM-T903 - Site Statistics > Deactivating a user increments the Daily and Monthly Active Users counts down', () => {
    //     cy.apiInitSetup().then(({team, user}) => {
    //         const testUser = user;
    //         const testTeam = team;

    //         // # Login as test user and visit town-square
    //         cy.apiLogin(testUser);
    //         cy.visit(`/${testTeam.name}/channels/town-square`);

    //         // # Wait two seconds then go to admin console
    //         cy.wait(TIMEOUTS.TWO_SEC);
    //         goToAdminConsole();
            
    //         // # Go to system analytics
    //         cy.get('#reporting\\/system_analytics').click();
    //         cy.wait(TIMEOUTS.ONE_SEC);

    //         let totalActiveUsersInitial, dailyActiveUsersInital, monthlyActiveUsersInital, totalActiveUsersFinal, dailyActiveUsersFinal, monthlyActiveUsersFinal;

    //         // # Get the number and turn them into numbers 
    //         cy.findByTestId('totalActiveUsers').invoke('text').then(text => {
    //             totalActiveUsersInitial = parseInt(text, 10);
    //             cy.findByTestId('dailyActiveUsers').invoke('text').then(text => {
    //                 dailyActiveUsersInital = parseInt(text, 10);
    //                 cy.findByTestId('monthlyActiveUsers').invoke('text').then(text => {
    //                     monthlyActiveUsersInital = parseInt(text, 10);

    //                     // # Deactivate user and relaod page and then wait 2 seconds
    //                     cy.externalActivateUser(testUser.id, false);
    //                     cy.reload();
    //                     cy.wait(TIMEOUTS.TWO_SEC);

    //                     // # Get the numbers required again
    //                     cy.findByTestId('totalActiveUsers').invoke('text').then(text => {
    //                         totalActiveUsersFinal = parseInt(text, 10);

    //                         cy.findByTestId('dailyActiveUsers').invoke('text').then(text => {
    //                             dailyActiveUsersFinal = parseInt(text, 10);

    //                             cy.findByTestId('monthlyActiveUsers').invoke('text').then(text => {
    //                                 monthlyActiveUsersFinal = parseInt(text, 10);

    //                                 // * Assert that the final number is the initial number minus one
    //                                 expect(totalActiveUsersFinal).equal(totalActiveUsersInitial - 1);
    //                                 expect(dailyActiveUsersFinal).equal(dailyActiveUsersInital - 1);
    //                                 expect(monthlyActiveUsersFinal).equal(monthlyActiveUsersInital - 1);   
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });       
    //     });
    // });


    // it('MM-T905 - Site Statistics card labels in different languages', () => {
    //     cy.apiInitSetup().then(({team}) => {
    //         const testTeam = team;
            
    //         cy.apiAdminLogin();
    //         cy.visit(`/${testTeam.name}/channels/town-square`);
    //         cy.get('#headerUsername').click();
    //         cy.get('#accountSettings').should('be.visible').click();
    //         cy.get('#displayButton').click();
    //         cy.get('#languagesEdit').click();
    //         cy.get('@inputEl').type('Français{enter}');
    //         cy.get('#saveSetting').click();
    //         cy.visit('/admin_console/reporting/system_analytics')
    //     });
    // });

    // This test assumes EE license already uploaded!
    it('MM-T1201 - Remove and re-add license - Permissions freeze in place when license is removed (and then re-added)', () => {
        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();
        cy.visit('admin_console/user_management/permissions/system_scheme');
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        cy.findByTestId('all_users-public_channel-create_public_channel-checkbox').click();
        cy.findByTestId('all_users-private_channel-manage_private_channel_properties-checkbox').click();
        cy.findByTestId('team_admin-private_channel-manage_private_channel_properties-checkbox').click();
        cy.findByTestId('saveSetting').click();

        // # Create a user, this will be our non team admin user
        cy.apiInitSetup().then(({team, user, channel}) => {
            const testTeam = team;
            const testUserNonTeamAdmin = user;


            // # Make a new user, this will be our team admin
            cy.apiCreateUser().then(({user: newUser}) => {

                // # Add him to the test team 
                cy.apiAddUserToTeam(testTeam.id, newUser.id).then(() => {
                    const testUserTeamAdmin = newUser;
                    promoteToChannelOrTeamAdmin(testUserTeamAdmin.id, testTeam.id, 'teams');
                    
                    // * Login as system admin and go the channel we created earlier and make sure the create public channel button is visible
                    cy.apiAdminLogin();
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                    cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
                    cy.wait(TIMEOUTS.FIVE_SEC);

                    // * Login as team admin and go the channel we created earlier and make sure the create public channel button is visible
                    cy.apiLogin(testUserTeamAdmin);
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                    cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
                    cy.wait(TIMEOUTS.FIVE_SEC);

                    // * Login as non-team admin and go the channel we created earlier and make sure the create public channel button is not visible
                    cy.apiLogin(testUserNonTeamAdmin);
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                    cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
                    cy.wait(TIMEOUTS.FIVE_SEC);

                    // # Login as a Admin and visit the channel
                    cy.apiAdminLogin();
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                    // # Click the channel header dropdown
                    cy.get('#channelHeaderDropdownIcon').click();

                    // * Channel convert to private should be visible and confirm
                    cy.get('#channelConvertToPrivate').should('be.visible').click();
                    cy.findByTestId('convertChannelConfirm').should('be.visible').click();

                    // * Click drop down and ensure the channel rename is visible for a system admin
                    cy.get('#channelHeaderDropdownIcon', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
                    cy.get('#channelRename').should('be.visible');

                    cy.apiLogin(testUserTeamAdmin);
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                    // * Click drop down and ensure the channel rename is visible for a team admin
                    cy.get('#channelHeaderDropdownIcon',{timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
                    cy.get('#channelRename').should('be.visible');

                    cy.apiLogin(testUserNonTeamAdmin);
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                    // * Click drop down and ensure the channel rename is not visible for a non team admin
                    cy.get('#channelHeaderDropdownIcon', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();
                    cy.get('#channelRename').should('not.be.visible');

                });
            });

        });

    });
 
});

