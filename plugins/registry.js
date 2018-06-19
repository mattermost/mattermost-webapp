// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import reducerRegistry from 'mattermost-redux/store/reducer_registry';

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

    // Register a component in the first section of the profile popover (hovercard), below the user's name.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverSection1Component = (component) => {
        return dispatchPluginComponentAction('PopoverSection1', this.id, component);
    }

    // Register a component in the second section of the profile popover (hovercard), below the user's email.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverSection2Component = (component) => {
        return dispatchPluginComponentAction('PopoverSection2', this.id, component);
    }

    // Register a component in the third section of the profile popover (hovercard), below the send message button.
    // Accepts a React component. Returns a unique identifier.
    registerPopoverSection3Component = (component) => {
        return dispatchPluginComponentAction('PopoverSection3', this.id, component);
    }

    // Register a custom button component to add to the channel header. If there are more than one
    // buttons registered by any plugin, a dropdown menu is created to contain all the plugin buttons.
    // Accepts the following:
    // - buttonComponent - custom button component displayed in the channel header
    // - dropdownComponent - custom dropdown item component displayed in the dropdown menu
    // Returns a unique indentifier.
    registerChannelHeaderButtonComponent = (buttonComponent, dropdownComponent) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'ChannelHeaderButton',
            data: {
                id,
                pluginId: this.id,
                buttonComponent,
                dropdownComponent,
            },
        });

        return id;
    }

    // Add a button to the channel header. If there are more than one buttons registered by any
    // plugin, a dropdown menu is created to contain all the plugin buttons.
    // Accepts the following:
    // - icon - JSX element to use as the button's icon
    // - action - a function called when the button is clicked
    // - dropdown_text - string or JSX element shown for the dropdown button description
    registerChannelHeaderButtonAction = (icon, action, dropdownText) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'ChannelHeaderButton',
            data: {
                id,
                pluginId: this.id,
                icon,
                action,
                dropdownText,
            },
        });

        return id;
    }

    // Register a custom button component to add to the mobile channel header. If there are more than one
    // buttons registered by any plugin, buttons will instead be added to the channel header dropdown.
    // Accepts the following:
    // - buttonComponent - custom button component displayed in the channel header
    // - dropdownComponent - custom dropdown item component displayed in the dropdown menu
    // Returns a unique indentifier.
    registerMobileChannelHeaderButtonComponent = (buttonComponent, dropdownComponent) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MobileChannelHeaderButton',
            data: {
                id,
                pluginId: this.id,
                buttonComponent,
                dropdownComponent,
            },
        });

        return id;
    }

    // Add a button to the mobile channel header. If there are more than one buttons registered by any
    // plugin, buttons will instead be added to the channel header dropdown.
    // Accepts the following:
    // - icon - JSX element to use as the button's icon
    // - action - a function called when the button is clicked
    // - dropdown_text - string or JSX element shown for the dropdown button description
    registerMobileChannelHeaderButtonAction = (icon, action, dropdownText) => {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MobileChannelHeaderButton',
            data: {
                id,
                pluginId: this.id,
                icon,
                action,
                dropdownText,
            },
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

    // Deregister a component using the unique identifier returned after registration.
    // Accepts a string id.
    // Returns undefined in all cases.
    deregisterComponent = (componentId) => {
        store.dispatch({
            type: ActionTypes.REMOVED_PLUGIN_COMPONENT,
            id: componentId,
        });
    }

    // Register a reducer against the Redux store. It will accessible in redux state
    // under "state['plugins-<yourpluginid>']"
    // Accepts a reducer. Returns undefined.
    registerReducer = (reducer) => {
        reducerRegistry.register('plugins-' + this.id, reducer);
    }
}