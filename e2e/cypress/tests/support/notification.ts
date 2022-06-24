// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

window.Notification;

// Stub the browser notification API with the given name and permission
export function spyNotificationAs(name: string, permission: any) {
    cy.window().then((win) => {
        function Notification(title: string, opts: Record<string, any>) {
            this.title = title;
            this.opts = opts;
        }

        Notification.requestPermission = () => permission;
        Notification.close = () => true;

        (win as any).Notification = Notification as unknown as (typeof window.Notification);

        cy.stub(win, 'Notification').as(name);
    });

    cy.window().should('have.property', 'Notification');
}
