// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

// EXPERIMENTAL - SUBJECT TO CHANGE

import {Client4} from 'mattermost-redux/client';

import store from 'stores/redux_store.jsx';

import {ActionTypes} from 'utils/constants.jsx';
import {getSiteURL} from 'utils/url.jsx';

window.plugins = {};

// Common libraries exposed on window for plugins to access
window.react = require('react');
window['react-dom'] = require('react-dom');
window.redux = require('redux');
window['react-redux'] = require('react-redux');
window['react-bootstrap'] = require('react-bootstrap');

export function registerComponents(id, components = {}, postTypes = {}) {
    const wrappedComponents = {};
    Object.keys(components).forEach((name) => {
        wrappedComponents[name] = {component: components[name], id};
    });

    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_COMPONENTS,
        data: wrappedComponents
    });

    const wrappedPostTypes = {};
    Object.keys(postTypes).forEach((type) => {
        wrappedPostTypes[type] = {component: postTypes[type], id};
    });

    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_POST_TYPES,
        data: wrappedPostTypes
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
        // Add the plugin's js to the page
        const script = document.createElement('script');
        script.id = 'plugin_' + manifest.id;
        script.type = 'text/javascript';
        script.text = this.responseText;
        document.getElementsByTagName('head')[0].appendChild(script);

        // Initialize the plugin
        console.log('Registering ' + manifest.id + ' plugin...'); //eslint-disable-line no-console
        const plugin = window.plugins[manifest.id];
        plugin.initialize(registerComponents.bind(null, manifest.id), store);
        console.log('...done'); //eslint-disable-line no-console
    }

    // Fetch the plugin's bundled js
    const xhrObj = new XMLHttpRequest();

    // Backwards compatibility for old plugins
    let bundlePath = manifest.webapp.bundle_path;
    if (bundlePath.includes('/static/') && !bundlePath.includes('/static/plugins/')) {
        bundlePath = bundlePath.replace('/static/', '/static/plugins/');
    }

    xhrObj.open('GET', getSiteURL() + bundlePath, true);
    xhrObj.addEventListener('load', onLoad);
    xhrObj.send('');
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
