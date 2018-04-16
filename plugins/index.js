// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

// EXPERIMENTAL - SUBJECT TO CHANGE

import {Client4} from 'mattermost-redux/client';

import store from 'stores/redux_store.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import {getSiteURL} from 'utils/url.jsx';
import {formatText} from 'utils/text_formatting.jsx';
import {messageHtmlToComponent} from 'utils/post_utils.jsx';

window.plugins = {};

// Common libraries exposed on window for plugins to access
window.react = require('react');
window['react-dom'] = require('react-dom');
window.redux = require('redux');
window['react-redux'] = require('react-redux');
window['react-bootstrap'] = require('react-bootstrap');
window['post-utils'] = {formatText, messageHtmlToComponent};

export function registerComponents(id, components = {}, postTypes = {}, mainMenuActions = []) {
    const wrappedComponents = {};
    Object.keys(components).forEach((name) => {
        wrappedComponents[name] = {component: components[name], id};
    });

    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_COMPONENTS,
        data: wrappedComponents,
    });

    const wrappedPostTypes = {};
    Object.keys(postTypes).forEach((type) => {
        wrappedPostTypes[type] = {component: postTypes[type], id};
    });

    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_POST_TYPES,
        data: wrappedPostTypes,
    });

    const wrappedMainMenuActions = mainMenuActions.map((action) => ({id, ...action}));

    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_MENU_ACTIONS,
        data: wrappedMainMenuActions,
    });
}

export async function initializePlugins() {
    if (store.getState().entities.general.config.PluginsEnabled !== 'true') {
        return;
    }

    const {data, error} = await getPlugins()(store.dispatch);
    if (error) {
        console.error(error); //eslint-disable-line no-console
        return;
    }

    if (data == null || data.length === 0) {
        return;
    }

    data.forEach((m) => {
        loadPlugin(m);
    });
}

export function getPlugins() {
    return async (dispatch) => {
        let plugins;
        try {
            plugins = await Client4.getWebappPlugins();
        } catch (error) {
            return {error};
        }

        dispatch({type: ActionTypes.RECEIVED_WEBAPP_PLUGINS, data: plugins});

        return {data: plugins};
    };
}

export function loadPlugin(manifest) {
    function onLoad() {
        // Initialize the plugin
        console.log('Registering ' + manifest.id + ' plugin...'); //eslint-disable-line no-console
        const plugin = window.plugins[manifest.id];
        plugin.initialize(registerComponents.bind(null, manifest.id), store);
        console.log('...done'); //eslint-disable-line no-console
    }

    // Backwards compatibility for old plugins
    let bundlePath = manifest.webapp.bundle_path;
    if (bundlePath.includes('/static/') && !bundlePath.includes('/static/plugins/')) {
        bundlePath = bundlePath.replace('/static/', '/static/plugins/');
    }

    const script = document.createElement('script');
    script.id = 'plugin_' + manifest.id;
    script.type = 'text/javascript';
    script.src = getSiteURL() + bundlePath;
    script.onload = onLoad;
    document.getElementsByTagName('head')[0].appendChild(script);
}

export function removePlugin(manifest) {
    const script = document.getElementById('plugin_' + manifest.id);
    script.parentNode.removeChild(script);
    console.log('Removed ' + manifest.id + ' plugin'); //eslint-disable-line no-console
}

export async function loadPluginsIfNecessary() {
    if (store.getState().entities.general.config.PluginsEnabled !== 'true') {
        return;
    }

    const oldManifests = store.getState().plugins.plugins;

    const {error} = await getPlugins()(store.dispatch);
    if (error) {
        console.error(error); //eslint-disable-line no-console
        return;
    }

    const newManifests = store.getState().plugins.plugins;

    // Get new plugins and update existing plugins if version changed
    Object.values(newManifests).forEach((newManifest) => {
        const oldManifest = oldManifests[newManifest.id];
        if (!oldManifest || oldManifest.version !== newManifest.version) {
            loadPlugin(newManifest);
        }
    });

    // Remove old plugins
    Object.keys(oldManifests).forEach((id) => {
        if (!newManifests.hasOwnProperty(id)) {
            const oldManifest = oldManifests[id];
            store.dispatch({type: ActionTypes.REMOVED_WEBAPP_PLUGIN, data: oldManifest});
            removePlugin(oldManifest);
        }
    });
}
