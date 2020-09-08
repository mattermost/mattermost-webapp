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

import {showRHSPlugin, hideRHSPlugin, toggleRHSPlugin} from 'actions/views/rhs';

import {
    registerPluginTranslationsSource,
} from 'actions/views/root';

import {
    registerAdminConsolePlugin,
    unregisterAdminConsolePlugin,
    registerAdminConsoleCustomSetting,
} from 'actions/admin_actions';

import store from 'stores/redux_store.jsx';
import {ActionTypes} from 'utils/constants';
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
    if (element && !React.isValidElement(element) && typeof element !== 'string') {
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

    // Register a component fixed to the bottom of the post message.
    // Accepts a React component. Returns a unique identifier.
    registerPostMessageAttachmentComponent(component) {
        return dispatchPluginComponentAction('PostMessageAttachment', this.id, component);
    }

    // Register a component to show as a tooltip when a user hovers on a link in a post.
    // Accepts a React component. Returns a unique identifier.
    registerLinkTooltipComponent(component) {
        return dispatchPluginComponentAction('LinkTooltip', this.id, component);
    }

    // Add a button to the channel header. If there are more than one buttons registered by any
    // plugin, a dropdown menu is created to contain all the plugin buttons.
    // Accepts the following:
    // - icon - React element to use as the button's icon
    // - action - a function called when the button is clicked, passed the channel and channel member as arguments
    // - dropdown_text - string or React element shown for the dropdown button description
    // - tooltip_text - string shown for tooltip appear on hover
    registerChannelHeaderButtonAction(icon, action, dropdownText, tooltipText) {
        const id = generateId();

        const data = {
            id,
            pluginId: this.id,
            icon: resolveReactElement(icon),
            action,
            dropdownText: resolveReactElement(dropdownText),
            tooltipText,
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

    // Add a "call button"" next to the attach file button. If there are more than one button registered by any
    // plugin, a dropdown menu is created to contain all the call plugin buttons.
    // Accepts the following:
    // - icon - React element to use as the button's icon
    // - action - a function called when the button is clicked, passed the channel and channel member as arguments
    // - dropdown_text - string or React element shown for the dropdown button description
    // - tooltip_text - string shown for tooltip appear on hover
    // Returns an unique identifier
    // Minimum required version: 5.28
    registerCallButtonAction(icon, action, dropdownText, tooltipText) {
        const id = generateId();

        const data = {
            id,
            pluginId: this.id,
            icon: resolveReactElement(icon),
            action,
            dropdownText: resolveReactElement(dropdownText),
            tooltipText,
        };

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'CallButton',
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
    // Custom post types can also apply for ephemeral posts.
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

    // Register a component to render a custom body for post cards with a specific type.
    // Custom post types must be prefixed with 'custom_'.
    // Accepts a string type and a component.
    // Returns a unique identifier.
    registerPostCardTypeComponent(type, component) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_POST_CARD_COMPONENT,
            data: {
                id,
                pluginId: this.id,
                type,
                component,
            },
        });

        return id;
    }

    // Register a component to render a custom embed preview for post links.
    // Accepts the following:
    // - match - A function that receives the embed object and returns a
    //   boolean indicating if the plugin is able to process it.
    //   The embed object contains the embed `type`, the `url` of the post link
    //   and in some cases, a `data` object with information related to the
    //   link (the opengraph or the image details, for example).
    // - component - The component that renders the embed view for the link
    // - toggleable - A boolean indicating if the embed view should be collapsable
    // Returns a unique identifier.
    registerPostWillRenderEmbedComponent(match, component, toggleable) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'PostWillRenderEmbedComponent',
            data: {
                id,
                pluginId: this.id,
                component,
                match,
                toggleable,
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

    // Register a channel menu list item by providing some text and an action function.
    // Accepts the following:
    // - text - A string or React element to display in the menu
    // - action - A function that receives the channelId and is called when the menu items is clicked.
    // Returns a unique identifier.
    registerChannelHeaderMenuAction(text, action) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'ChannelHeader',
            data: {
                id,
                pluginId: this.id,
                text: resolveReactElement(text),
                action,
            },
        });

        return id;
    }

    // Register a post menu list item by providing some text and an action function.
    // Accepts the following:
    // - text - A string or React element to display in the menu
    // - action - A function to trigger when component is clicked on
    // - filter - A function whether to apply the plugin into the post' dropdown menu
    // Returns a unique identifier.
    registerPostDropdownMenuAction(text, action, filter) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'PostDropdownMenu',
            data: {
                id,
                pluginId: this.id,
                text: resolveReactElement(text),
                action,
                filter,
            },
        });

        return id;
    }

    // Register a post sub menu list item by providing some text and an action function.
    // Accepts the following:
    // - text - A string or React element to display in the menu
    // - action - A function to trigger when component is clicked on
    // - filter - A function whether to apply the plugin into the post' dropdown menu
    //
    // Returns an unique identifier for the root submenu, and a function to register submenu items.
    // At this time, only one level of nesting is allowed to avoid rendering issue in the RHS.
    registerPostDropdownSubMenuAction(text, action, filter) {
        function registerMenuItem(pluginId, id, parentMenuId, innerText, innerAction, innerFilter) {
            store.dispatch({
                type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
                name: 'PostDropdownMenu',
                data: {
                    id,
                    parentMenuId,
                    pluginId,
                    text: resolveReactElement(innerText),
                    subMenu: [],
                    action: innerAction,
                    filter: innerFilter,
                },
            });
            return function registerSubMenuItem(t, a, f) {
                if (parentMenuId) {
                    throw new Error('Submenus are currently limited to a single level.');
                }

                return registerMenuItem(pluginId, generateId(), id, t, a, f);
            };
        }
        const id = generateId();
        return {id, rootRegisterMenuItem: registerMenuItem(this.id, id, null, text, action, filter)};
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

    // Register a hook to intercept file uploads before they take place.
    // Accepts a function to run before files get uploaded. Receives an array of
    // files and a function to upload files at a later time as arguments. Must
    // return an object that can contain two properties:
    // - message - An error message to display, leave blank or null to display no message
    // - files - Modified array of files to upload, set to null to reject all files
    // Returns a unique identifier.
    registerFilesWillUploadHook(hook) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FilesWillUploadHook',
            data: {
                id,
                pluginId: this.id,
                hook,
            },
        });

        return id;
    }

    // Unregister a component, action or hook using the unique identifier returned after registration.
    // Accepts a string id.
    // Returns undefined in all cases.
    unregisterComponent(componentId) {
        store.dispatch({
            type: ActionTypes.REMOVED_PLUGIN_COMPONENT,
            id: componentId,
        });
    }

    // Unregister a component that provided a custom body for posts with a specific type.
    // Accepts a string id.
    // Returns undefined in all cases.
    unregisterPostTypeComponent(componentId) {
        store.dispatch({
            type: ActionTypes.REMOVED_PLUGIN_POST_COMPONENT,
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

    // Register a hook that will be called when a message is posted by the user before it
    // is sent to the server. Accepts a function that receives the post as an argument.
    //
    // To reject a post, return an object containing an error such as
    //     {error: {message: 'Rejected'}}
    // To modify or allow the post without modifcation, return an object containing the post
    // such as
    //     {post: {...}}
    //
    // If the hook function is asynchronous, the message will not be sent to the server
    // until the hook returns.
    registerMessageWillBePostedHook(hook) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MessageWillBePosted',
            data: {
                id,
                pluginId: this.id,
                hook,
            },
        });

        return id;
    }

    // Register a hook that will be called when a slash command is posted by the user before it
    // is sent to the server. Accepts a function that receives the message (string) and the args
    // (object) as arguments.
    // The args object is:
    //        {
    //            channel_id: channelId,
    //            team_id: teamId,
    //            root_id: rootId,
    //            parent_id: rootId,
    //        }
    //
    // To reject a command, return an object containing an error:
    //     {error: {message: 'Rejected'}}
    // To ignore a command, return an empty object (to prevent an error from being displayed):
    //     {}
    // To modify or allow the command without modification, return an object containing the new message
    // and args. It is not likely that you will need to change the args, so return the object that was provided:
    //     {message: {...}, args}
    //
    // If the hook function is asynchronous, the command will not be sent to the server
    // until the hook returns.
    registerSlashCommandWillBePostedHook(hook) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'SlashCommandWillBePosted',
            data: {
                id,
                pluginId: this.id,
                hook,
            },
        });

        return id;
    }

    // Register a hook that will be called before a message is formatted into Markdown.
    // Accepts a function that receives the unmodified post and the message (potentially
    // already modified by other hooks) as arguments. This function must return a string
    // message that will be formatted.
    // Returns a unique identifier.
    registerMessageWillFormatHook(hook) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'MessageWillFormat',
            data: {
                id,
                pluginId: this.id,
                hook,
            },
        });

        return id;
    }

    // Register a component to override file previews. Accepts a function to run before file is
    // previewed and a react component to be rendered as the file preview.
    // - override - A function to check whether preview needs to be overridden. Receives fileInfo and post as arguments.
    // Returns true is preview should be overridden and false otherwise.
    // - component - A react component to display instead of original preview. Receives fileInfo and post as props.
    // Returns a unique identifier.
    // Only one plugin can override a file preview at a time. If two plugins try to override the same file preview, the first plugin will perform the override and the second will not. Plugin precedence is ordered alphabetically by plugin ID.
    registerFilePreviewComponent(override, component) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FilePreview',
            data: {
                id,
                pluginId: this.id,
                override,
                component,
            },
        });

        return id;
    }

    registerTranslations(getTranslationsForLocale) {
        store.dispatch(registerPluginTranslationsSource(this.id, getTranslationsForLocale));
    }

    // Register a admin console definitions override function
    // Note that this is a low-level interface primarily meant for internal use, and is not subject
    // to semver guarantees. It may change in the future.
    // Accepts the following:
    // - func - A function that recieve the admin console config definitions and return a new
    //          version of it, which is used for build the admin console.
    // Each plugin can register at most one admin console plugin function, with newer registrations
    // replacing older ones.
    registerAdminConsolePlugin(func) {
        store.dispatch(registerAdminConsolePlugin(this.id, func));
    }

    // Register a custom React component to manage the plugin configuration for the given setting key.
    // Accepts the following:
    // - key - A key specified in the settings_schema.settings block of the plugin's manifest.
    // - component - A react component to render in place of the default handling.
    // - options - Object for the following available options to display the setting:
    //     showTitle - Optional boolean that if true the display_name of the setting will be rendered
    // on the left column of the settings page and the registered component will be displayed on the
    // available space in the right column.
    registerAdminConsoleCustomSetting(key, component, {showTitle} = {}) {
        store.dispatch(registerAdminConsoleCustomSetting(this.id, key, component, {showTitle}));
    }

    // Unregister a previously registered admin console definition override function.
    // Returns undefined.
    unregisterAdminConsolePlugin() {
        store.dispatch(unregisterAdminConsolePlugin(this.id));
    }

    // Register a Right-Hand Sidebar component by providing a title for the right hand component.
    // Accepts the following:
    // - title - A string or JSX element to display as a title for the RHS.
    // - component - A react component to display in the Right-Hand Sidebar.
    // Returns:
    // - id: a unique identifier
    // - showRHSPlugin: the action to dispatch that will open the RHS.
    // - hideRHSPlugin: the action to dispatch that will close the RHS
    // - toggleRHSPlugin: the action to dispatch that will toggle the RHS
    registerRightHandSidebarComponent(component, title) {
        const id = generateId();

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'RightHandSidebarComponent',
            data: {
                id,
                pluginId: this.id,
                component,
                title,
            },
        });

        return {id, showRHSPlugin: showRHSPlugin(id), hideRHSPlugin: hideRHSPlugin(id), toggleRHSPlugin: toggleRHSPlugin(id)};
    }

    // Register a Needs Team component by providing a route past /:team/:pluginId/ to be displayed at.
    // Accepts the following:
    // - route - The route to be displayed at.
    // - component - A react component to display.
    // Returns:
    // - id: a unique identifier
    registerNeedsTeamRoute(route, component) {
        const id = generateId();
        let fixedRoute = route.trim();
        if (fixedRoute[0] === '/') {
            fixedRoute = fixedRoute.substring(1);
        }
        fixedRoute = this.id + '/' + fixedRoute;

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'NeedsTeamComponent',
            data: {
                id,
                pluginId: this.id,
                component,
                route: fixedRoute,
            },
        });

        return id;
    }

    // Register a component to be displayed at a custom route under /plug/:pluginId
    // Accepts the following:
    // - route - The route to be displayed at.
    // - component - A react component to display.
    // Returns:
    // - id: a unique identifier
    registerCustomRoute(route, component) {
        const id = generateId();
        let fixedRoute = route.trim();
        if (fixedRoute[0] === '/') {
            fixedRoute = fixedRoute.substring(1);
        }
        fixedRoute = this.id + '/' + fixedRoute;

        store.dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'CustomRouteComponent',
            data: {
                id,
                pluginId: this.id,
                component,
                route: fixedRoute,
            },
        });

        return id;
    }
}
