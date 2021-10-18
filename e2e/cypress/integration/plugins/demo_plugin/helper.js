// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function uninstallAllPlugins() {
    cy.apiGetAllPlugins().then(({plugins}) => {
        const {active, inactive} = plugins;
        inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
        active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
    });
}
