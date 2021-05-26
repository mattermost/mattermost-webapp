// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {hexToRgbArray, rgbArrayToString} from '../../../utils';

describe('Announcement Banner', () => {
    it('MM-T1128 Announcement Banner - Dismissible banner shows long text truncated', () => {
        const bannerText =
            "Here's an announcement! It has a link: http://example.com. It's a really long announcement, because we have a lot to say. Be sure to read it all, click the link, then dismiss the banner, and then you can go on to the next test, which will have a shorter announcement. Thank you for reading and have a nice day!";
        const bannerBgColor = '#4378da';
        const bannerBgColorRGBArray = hexToRgbArray(bannerBgColor);
        const bannerTextColor = '#ffffff';
        const bannerTextColorRGBArray = hexToRgbArray(bannerTextColor);

        // # Login as System Admin
        cy.apiAdminLogin();

        // # Go to announcement banner page of system console
        cy.visit('/admin_console/site_config/announcement_banner');

        // # Enable banner if not already enabled
        cy.findByTestId('AnnouncementSettings.EnableBanner').within(() => {
            cy.findByText('true').should('be.visible').click({force: true});
        });

        // # Enter the long banner text
        cy.findByTestId('AnnouncementSettings.BannerText').within(() => {
            cy.get('input').should('be.visible').clear().type(bannerText);
        });

        // # Change the banner background color
        cy.findByTestId('AnnouncementSettings.BannerColor').within(() => {
            cy.get('input').should('be.visible').clear().type(bannerBgColor);
        });

        // # Change the banner text color
        cy.findByTestId('AnnouncementSettings.BannerTextColor').within(() => {
            cy.get('input').should('be.visible').clear().type(bannerTextColor);
        });

        // # Allow for banner dismissal to true
        cy.findByTestId('AnnouncementSettings.AllowBannerDismissal').within(
            () => {
                cy.findByText('true').
                    should('be.visible').
                    click({force: true});
            },
        );

        // # Click on the save button
        cy.get('.admin-console').within(() => {
            cy.findByText('Save').should('be.visible').click();
        });

        // * Verify banner text overflows, and its background and color matches to configuration entered before
        cy.get('.announcement-bar').
            should('exist').
            and('have.css', 'overflow', 'hidden').
            and(
                'have.css',
                'background-color',
                rgbArrayToString(bannerBgColorRGBArray),
            ).
            and(
                'have.css',
                'color',
                rgbArrayToString(bannerTextColorRGBArray),
            );

        // * Verify the banner text's first part is visible not the end part
        cy.findByText(/Here's an announcement! It has a link: /).and(
            (paragraph) => {
                expect(paragraph.width()).to.be.greaterThan(
                    Cypress.config('viewportWidth'),
                );
            },
        );

        // # Hover over the banner
        cy.get('.announcement-bar').trigger('mouseover');

        // * Verify popover is visible
        cy.get('#announcement-bar__tooltip').
            should('be.visible').
            within(() => {
                // * Verify compelete banner is present in the popover
                cy.findByText(/Here's an announcement! It has a link: /).should(
                    'be.visible',
                );
                cy.findByText(
                    /. It's a really long announcement, because we have a lot to say. Be sure to read it all, click the link, then dismiss the banner, and then you can go on to the next test, which will have a shorter announcement. Thank you for reading and have a nice day!/,
                ).should('be.visible');
            });

        // # Close the banner
        cy.get('.announcement-bar__close').should('be.visible').click();

        // * Verify  the banner is closed
        cy.get('.announcement-bar').should('not.exist');
    });
});
