// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import reducerRegistry from 'mattermost-redux/store/reducer_registry';

import {registerPluginWebSocketEvent, unregisterPluginWebSocketEvent} from 'actions/websocket_actions.jsx';

import store from 'stores/redux_store.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import {generateId} from 'utils/utils.jsx';

function dispatchPluginComponentAction(name, pluginId, component, id = generateId()) {
    store.dispatch({
        type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
        name,
        data: {
            id,
            pluginId,
            component,
        },
    });

    return id;
}

export default class PluginRegistry {
    constructor(id) {
        this.id = id;
    }

    // Register a component at the root of the channel view of the app.
    // Accepts a React component. Returns a unique identifier.
    registerRootComponent = (component) => {
        return dispatchPluginComponentAction('Root', this.id, component);
    }

    // Register a component in the user attributes section of the profile popover (hovercard), below the default user attributes.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverUserAttributesComponent = (component) => {
        return dispatchPluginComponentAction('PopoverUserAttributes', this.id, component);
    }

    // Register a component in the user actions of the profile popover (hovercard), below the default actions.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverUserActionsComponent = (component) => {
        return dispatchPluginComponentAction('PopoverUserActions', this.id, component);
    }

    // Add a button to the channel header. If there are more than one buttons registered by any
    // plugin, a dropdown menu is created to contain all the plugin buttons.
    // Accepts the following:
    // - icon - JSX element to use as the button's icon
    // - action - a function called when the button is clicked
    // - dropdown_text - string or JSX element shown for the dropdown button description
    registerChannelHeaderButtonAction = (icon, action, dropdownText) => {
        const id = generateId();

        const data = {
            id,
            pluginId: this.id,
            icon,
            action,
            dropdownText,
        };

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'ChannelHeaderButton',
            data,
        });

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MobileChannelHeaderButton',
            data,
        });

        return id;
    }

    // Register a component to render a custom body for posts with a specific type.
    // Custom post types must be prefixed with 'custom_'.
    // Accepts a string type and a component.
    // Returns a unique identifier.
    registerPostTypeComponent = (type, component) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_POST_COMPONENT,
            data: {
                id,
                pluginId: this.id,
                type,
                component,
            },
        });

        return id;
    }

    // Register a main menu list item by providing some text and an action function.
    // Accepts the following:
    // - text - A string or JSX element to display in the menu
    // - action - A function to trigger when component is clicked on
    // - mobileIcon - An icon to display in the menu in mobile view
    // Returns a unique identifier.
    registerMainMenuAction = (text, action, mobileIcon) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MainMenu',
            data: {
                id,
                pluginId: this.id,
                text,
                action,
                mobileIcon,
            },
        });

        return id;
    }

    // Unregister a component using the unique identifier returned after registration.
    // Accepts a string id.
    // Returns undefined in all cases.
    unregisterComponent = (componentId) => {
        store.dispatch({
            type: ActionTypes.REMOVED_PLUGIN_COMPONENT,
            id: componentId,
        });
    }

    // Register a reducer against the Redux store. It will be accessible in redux state
    // under "state['plugins-<yourpluginid>']"
    // Accepts a reducer. Returns undefined.
    registerReducer = (reducer) => {
        reducerRegistry.register('plugins-' + this.id, reducer);
    }

    // Register a handler for WebSocket events.
    // Accepts the following:
    // - event - the event type, can be a regular server event or an event from plugins.
    // Plugin events will have "custom_<pluginid>_" prepended
    // - handler - a function to handle the event, receives the event message as an argument
    // Returns undefined.
    registerWebSocketEventHandler = (event, handler) => {
        registerPluginWebSocketEvent(event, handler);
    }

    // Unregister a handler for a custom WebSocket event.
    // Accepts a string event type.
    // Returns undefined.
    unregisterWebSocketEventHandler = (event) => {
        unregisterPluginWebSocketEvent(event);
    }
}