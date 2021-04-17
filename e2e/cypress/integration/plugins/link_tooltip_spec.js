// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Group: @not_cloud @plugin

import {demoPlugin} from '../../utils/plugins';

describe('Link tooltips', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();
        cy.apiUploadAndEnablePlugin(demoPlugin);
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
        cy.postMessage('www.test.com');
    });

    it('fade in and out with an animation', () => {
        cy.get('a[href*="www.test.com"] span').as('link');
        cy.contains('This is a custom tooltip from the Demo Plugin').parents('.tooltip-container').as('tooltip-container');

        cy.get('@link').trigger('mouseover');
        cy.get('@tooltip-container').should('have.class', 'visible');

        cy.get('@link').trigger('mouseout');
        cy.get('@tooltip-container').should('not.have.class', 'visible');
    });
});
