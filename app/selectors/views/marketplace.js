// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const getPlugins = (state) => state.views.marketplace.plugins;

export const getInstalledPlugins = (state) =>
    Object.values(getPlugins(state)).filter((p) => p.installed_version !== '');

export const getPlugin = (state, id) =>
    getPlugins(state).find(((p) => p.manifest && p.manifest.id === id));

export const getFilter = (state) => state.views.marketplace.filter;

export const getInstalling = (state, id) => Boolean(state.views.marketplace.installing[id]);

export const getError = (state, id) => state.views.marketplace.errors[id];
