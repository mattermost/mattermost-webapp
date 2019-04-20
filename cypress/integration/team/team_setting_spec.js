// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('MM-14632 Remove Team Icon', () => {
  before(() => {
    cy.apiLogin('sysadmin');
    cy.apiCreateTeam('test-team', 'Test Team').then(() => {
      cy.visit('/');
    });
    cy.get('#sidebarHeaderDropdownButton').click();
    cy.get('#teamSettings').click();
  });

  it('TS14632 Team Icon should be Removed', () => {
    // 1. On a Team taht has a team icon
    cy.get('#team_iconEdit').click();
    cy.uploadFile('.section-max input', '../fixtures/mattermost-icon.png', 'image/png')
    .trigger('change', { force: true });
    cy.get('#saveSettingPicture').should('not.have.css', 'disabled')
    cy.get('#saveSettingPicture').click();
    cy.get('#teamSettingsHeader > .close').click();
    
    
    // 2. Go to main menu > Team Settings > Team Icon > Edit
    cy.get('#sidebarHeaderDropdownButton').click();
    cy.get('#teamSettings').click();

    // 3. Click the x in the top right corner of the image, then click "Cancel".
    cy.get('#team_iconEdit').click();
    cy.get('.team-img__remove').click();
    cy.get('#cancelSettingPicture').click();
    cy.get('#team_iconEdit').click();
    cy.get('.img-preview__image > .team-img').should('be.visible');

    // 4. Click the x in the top right corner of the image, then click "Save".
    // After 4) Team icon is removed from modal, left-hand-side header and team sidebar (if you're on multiple teams)

    cy.get('.team-img__remove').click();
    cy.get('#saveSettingPicture').click();
    cy.get('#team_iconEdit').click();
    cy.get('.img-preview__image > .team-img').should('not.be.visible');
    cy.get('#teamSettingsHeader > .close').click();
    cy.get('team-container.active > .team-btn__image').should('not.be.visible');

  });

  
});


// background-image: url("http://localhost:8065/api/v4/teams/w5d1oo78eb8xjrww65zonm6whr/image?_=1555748070816");
// src="http://localhost:8065/api/v4/teams/w5d1oo78eb8xjrww65zonm6whr/image?_=1555748070816"