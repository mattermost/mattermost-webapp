// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiSave(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Save'}).scrollIntoView().click();
}
Cypress.Commands.add('uiSave', uiSave);

function uiCancel(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Cancel'}).click();
}
Cypress.Commands.add('uiCancel', uiCancel);

function uiClose(): ChainableT<JQuery> {
    return cy.findAllByRole('button', {name: 'Close'}).eq(0).click();
}
Cypress.Commands.add('uiClose', uiClose);

function uiSaveAndClose(): ChainableT<void> {
    cy.uiSave();
    cy.uiClose();
    return;
}
Cypress.Commands.add('uiSaveAndClose', uiSaveAndClose);

function uiGetButton(name: string): ChainableT<JQuery> {
    return cy.findByRole('button', {name});
}
Cypress.Commands.add('uiGetButton', uiGetButton);

function uiSaveButton(): ChainableT<JQuery> {
    return cy.uiGetButton('Save');
}
Cypress.Commands.add('uiSaveButton', uiSaveButton);

function uiCancelButton(): ChainableT<JQuery> {
    return cy.uiGetButton('Cancel');
}
Cypress.Commands.add('uiCancelButton', uiCancelButton);

function uiCloseButton(): ChainableT<JQuery> {
    return cy.uiGetButton('Close');
}
Cypress.Commands.add('uiCloseButton', uiCloseButton);

function uiGetRadioButton(name: string): ChainableT<JQuery> {
    return cy.findByRole('radio', {name}).should('be.visible');
}
Cypress.Commands.add('uiGetRadioButton', uiGetRadioButton);

function uiGetHeading(name: string): ChainableT<JQuery> {
    return cy.findByRole('heading', {name}).should('be.visible');
}
Cypress.Commands.add('uiGetHeading', uiGetHeading);

function uiGetTextbox(name: string): ChainableT<JQuery> {
    return cy.findByRole('textbox', {name}).should('be.visible');
}
Cypress.Commands.add('uiGetTextbox', uiGetTextbox);

function uiCloseOnboardingTaskList(): ChainableT<void> {
    cy.get('[data-cy=onboarding-task-list-action-button]').then(($btn) => {
        if ($btn.find('i.icon-close').length) {
            $btn.trigger('click');
        }
    });
    return null;
}
Cypress.Commands.add('uiCloseOnboardingTaskList', uiCloseOnboardingTaskList);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Click 'Save' button
             *
             * @example
             *   cy.uiSave();
             */
            uiSave: typeof uiSave;

            /**
             * Click 'Cancel' button
             *
             * @example
             *   cy.uiCancel();
             */
            uiCancel: typeof uiCancel;

            /**
             * Click 'Close' button
             *
             * @example
             *   cy.uiClose();
             */
            uiClose(): Chainable;

            /**
             * Click Save then Close buttons
             *
             * @example
             *   cy.uiSaveAndClose();
             */
            uiSaveAndClose: typeof uiSaveAndClose;

            /**
             * Get a button by its text using "cy.findByRole"
             *
             * @example
             *   cy.uiGetButton('Save');
             */
            uiGetButton: typeof uiGetButton;

            /**
             * Get save button
             *
             * @example
             *   cy.uiSaveButton();
             */
            uiSaveButton: typeof uiSaveButton;

            /**
             * Get cancel button
             *
             * @example
             *   cy.uiCancelButton();
             */
            uiCancelButton: typeof uiCancelButton;

            /**
             * Get close button
             *
             * @example
             *   cy.uiCloseButton();
             */
            uiCloseButton: typeof uiCloseButton;

            /**
             * Get a radio button by its text using "cy.findByRole"
             *
             * @example
             *   cy.uiGetRadioButton('Custom Theme');
             */
            uiGetRadioButton: typeof uiGetRadioButton;

            /**
             * Get a heading by its text using "cy.findByRole"
             *
             * @example
             *   cy.uiGetHeading('General Settings');
             */
            uiGetHeading: typeof uiGetHeading;

            /**
             * Get a textbox by its text using "cy.findByRole"
             *
             * @example
             *   cy.uiGetTextbox('Nickname');
             */
            uiGetTextbox: typeof uiGetTextbox;

            uiCloseOnboardingTaskList: typeof uiCloseOnboardingTaskList;
        }
    }
}
