// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Test channel public/private toggle', () => {
    it('Verify for System Admin', () => {
        cy.apiLogin('sysadmin');
        cy.visit('/');
        cy.getCurrentTeamId().then((teamId) => {
          return cy.apiCreateChannel(teamId, 'test-channel', 'Test Channel');
        }).then((res) => {
          const channel = res.body;
          assert(channel.type === 'O');
          cy.visit(`/admin_console/user_management/channels/${channel.id}`);
          cy.get('#channel_profile').contains(channel.name);
          cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
          cy.get('#saveSetting').click();
          cy.get('#confirmModalButton').click();
          return cy.apiGetChannel(channel.id);
        }).then((res) => {
          const channel = res.body;
          assert(channel.type === 'P');
          cy.visit(`/admin_console/user_management/channels/${channel.id}`);
          cy.get('#channel_profile').contains(channel.name);
          cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
          cy.get('#saveSetting').click();
          cy.get('#confirmModalButton').click();
          return cy.apiGetChannel(channel.id);
        }).then((res) => {
          const channel = res.body;
          assert(channel.type === 'O');
        });
   });
});
