// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Link preview - Removing it from my view removes it from other user\'s view', () => {
    before(() => {
        // # Set the configuration on Link Previews
        setSystemConsoleLinkPreview();
        setAccountSettingsLinkPreview('user-1');
        setAccountSettingsLinkPreview('sysadmin');

        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18708-Link preview - Removing it from my view removes it from other user\'s view', () => {
        const message = 'https://www.bbc.com/news/uk-wales-45142614';

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post message to use
                cy.postMessage(message);

                cy.getLastPostId().then((postId) => {
                    // * Check the preview is shown
                    cy.get(`#${postId}_message`).find('.file-preview__button').should('exist');

                    // # Log-in to the other user
                    cy.apiLogin('sysadmin');
                    cy.visit('/ad-1/messages/@user-1');

                    // * Check the preview is shown
                    cy.get(`#${postId}_message`).find('.file-preview__button').should('exist');

                    // # Log-in back to the first user
                    cy.apiLogin('user-1');
                    cy.visit('/ad-1/messages/@sysadmin');

                    // # Collapse the preview
                    cy.get(`#${postId}_message`).find('.post__embed-visibility').click({force: true});

                    // * Check the preview is not shown
                    cy.get(`#${postId}_message`).find('.file-preview__button').should('not.exist');

                    // # Log-in to the other user
                    cy.apiLogin('sysadmin');
                    cy.visit('/ad-1/messages/@user-1');

                    // * Check the preview is shown
                    cy.get(`#${postId}_message`).find('.file-preview__button').should('exist');

                    // # Log-in back to the first user
                    cy.apiLogin('user-1');
                    cy.visit('/ad-1/messages/@sysadmin');

                    // # Expand one more time the preview
                    cy.get(`#${postId}_message`).find('.post__embed-visibility').click({force: true});

                    // # Remove the preview
                    cy.get(`#${postId}_message`).find('#removePreviewButton').click({force: true});

                    // * Preview should not exist
                    cy.get(`#${postId}_message`).find('.attachment').should('not.exist');

                    // # Log-in to the other user
                    cy.apiLogin('sysadmin');
                    cy.visit('/ad-1/messages/@user-1');

                    // * Preview should not exist
                    cy.get(`#${postId}_message`).find('.attachment').should('not.exist');
                });
            });
        });
    });
});

function setSystemConsoleLinkPreview() {
    // # Log-in as SysAdmin
    cy.apiLogin('sysadmin');

    // # Go to post configuration
    cy.visit('/admin_console/site_config/posts');

    // # Check the LinkPreview option
    cy.get('[name="ServiceSettings.EnableLinkPreviews"]').filter('[value="true"]').check();

    // # Save settings
    cy.get('#saveSetting').click({force: true});
    cy.apiLogout();
}

function setAccountSettingsLinkPreview(user) {
    // # Log-in and go to /
    cy.apiLogin(user);
    cy.visit('/');

    // # Click header area to get the dropdown menu
    cy.get('#sidebarHeaderDropdownButton').click({force: true});

    // # Click account settings menu
    cy.get('#accountSettings').find('button').click({force: true});

    // # Click the Display setting
    cy.get('#displayButton').click({force: true});

    // # Click the edit button under Collapse options
    cy.get('#collapseEdit').click({force: true});

    // # Check the expanded option
    cy.get('#collapseFormatA').check();

    // # Save settings
    cy.get('#saveSetting').click({force: true});
    cy.apiLogout();
}