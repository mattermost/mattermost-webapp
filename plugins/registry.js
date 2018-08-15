// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import reducerRegistry from 'mattermost-redux/store/reducer_registry';

import {
    registerPluginWebSocketEvent,
    unregisterPluginWebSocketEvent,
    registerPluginReconnectHandler,
    unregisterPluginReconnectHandler,
} from 'actions/websocket_actions.jsx';

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

const resolveReactElement = (element) => {
    if (typeof element === 'function') {
        // Allow element to be passed as the name of the component, instead of a React element.
        return React.createElement(element);
    }

    return element;
};

export default class PluginRegistry {
    constructor(id) {
        this.id = id;
    }

    // Register a component at the root of the channel view of the app.
    // Accepts a React component. Returns a unique identifier.
    registerRootComponent(component) {
        return dispatchPluginComponentAction('Root', this.id, component);
    }

    // Register a component in the user attributes section of the profile popover (hovercard), below the default user attributes.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverUserAttributesComponent(component) {
        return dispatchPluginComponentAction('PopoverUserAttributes', this.id, component);
    }

    // Register a component in the user actions of the profile popover (hovercard), below the default actions.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverUserActionsComponent(component) {
        return dispatchPluginComponentAction('PopoverUserActions', this.id, component);
    }

    // Register a component fixed to the top of the left-hand channel sidebar.
    // Accepts a React component. Returns a unique identifier.
    registerLeftSidebarHeaderComponent(component) {
        return dispatchPluginComponentAction('LeftSidebarHeader', this.id, component);
    }

    // Register a component fixed to the bottom of the team sidebar. Does not render if
    // user is only on one team and the team sidebar is not shown.
    // Accepts a React component. Returns a unique identifier.
    registerBottomTeamSidebarComponent(component) {
        return dispatchPluginComponentAction('BottomTeamSidebar', this.id, component);
    }

    // Add a button to the channel header. If there are more than one buttons registered by any
    // plugin, a dropdown menu is created to contain all the plugin buttons.
    // Accepts the following:
    // - icon - React element to use as the button's icon
    // - action - a function called when the button is clicked, passed the channel and channel member as arguments
    // - dropdown_text - string or React element shown for the dropdown button description
    registerChannelHeaderButtonAction(icon, action, dropdownText) {
        const id = generateId();

        const data = {
            id,
            pluginId: this.id,
            icon: resolveReactElement(icon),
            action,
            dropdownText: resolveReactElement(dropdownText),
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
    registerPostTypeComponent(type, component) {
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
    // - text - A string or React element to display in the menu
    // - action - A function to trigger when component is clicked on
    // - mobileIcon - A React element to display as the icon in the menu in mobile view
    // Returns a unique identifier.
    registerMainMenuAction(text, action, mobileIcon) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MainMenu',
            data: {
                id,
                pluginId: this.id,
                text: resolveReactElement(text),
                action,
                mobileIcon: resolveReactElement(mobileIcon),
            },
        });

        return id;
    }

    // Register a post menu list item by providing some text and an action function.
    // Accepts the following:
    // - text - A string or React element to display in the menu
    // - action - A function to trigger when component is clicked on
    // Returns a unique identifier.
    registerPostDropdownMenuAction(text, action) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'PostDropdownMenu',
            data: {
                id,
                pluginId: this.id,
                text: resolveReactElement(text),
                action,
            },
        });

        return id;
    }

    // Register a component at the bottom of the post dropdown menu.
    // Accepts a React component. Returns a unique identifier.
    registerPostDropdownMenuComponent(component) {
        return dispatchPluginComponentAction('PostDropdownMenuItem', this.id, component);
    }

    // Register a file upload method by providing some text, an icon, and an action function.
    // Accepts the following:
    // - icon - JSX element to use as the button's icon
    // - text - A string or JSX element to display in the file upload menu
    // - action - A function to trigger when the menu item is selected.
    // Returns a unique identifier.
    registerFileUploadMethod(icon, action, text) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            data: {
                id,
                pluginId: this.id,
                text,
                action,
                icon,
            },
        });

        return id;
    }

    // Unregister a component using the unique identifier returned after registration.
    // Accepts a string id.
    // Returns undefined in all cases.
    unregisterComponent(componentId) {
        store.dispatch({
            type: ActionTypes.REMOVED_PLUGIN_COMPONENT,
            id: componentId,
        });
    }

    // Register a reducer against the Redux store. It will be accessible in redux state
    // under "state['plugins-<yourpluginid>']"
    // Accepts a reducer. Returns undefined.
    registerReducer(reducer) {
        reducerRegistry.register('plugins-' + this.id, reducer);
    }

    // Register a handler for WebSocket events.
    // Accepts the following:
    // - event - the event type, can be a regular server event or an event from plugins.
    // Plugin events will have "custom_<pluginid>_" prepended
    // - handler - a function to handle the event, receives the event message as an argument
    // Returns undefined.
    registerWebSocketEventHandler(event, handler) {
        registerPluginWebSocketEvent(this.id, event, handler);
    }

    // Unregister a handler for a custom WebSocket event.
    // Accepts a string event type.
    // Returns undefined.
    unregisterWebSocketEventHandler(event) {
        unregisterPluginWebSocketEvent(this.id, event);
    }

    // Register a handler that will be called when the app reconnects to the
    // internet after previously disconnecting.
    // Accepts a function to handle the event. Returns undefined.
    registerReconnectHandler(handler) {
        registerPluginReconnectHandler(this.id, handler);
    }

    // Unregister a previously registered reconnect handler.
    // Returns undefined.
    unregisterReconnectHandler() {
        unregisterPluginReconnectHandler(this.id);
    }

    registerMessageWillFormatHook(hook) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_HOOK,
            name: 'MessageWillFormat',
            data: {
                id,
                pluginId: this.id,
                hook,
            },
        });

        return id;
    }
}
