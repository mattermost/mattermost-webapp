// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, IntlShape} from 'react-intl';

import {sendEphemeralPost} from 'actions/global_actions';
import {AppCallResponseTypes, AppCallTypes} from 'mattermost-redux/constants/apps';
import {ActionResult} from 'mattermost-redux/types/actions';
import {AppBinding, AppCallRequest, AppCallResponse, AppCallType, AppForm} from 'mattermost-redux/types/apps';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {Theme} from 'mattermost-redux/types/themes';

import {PluginComponent} from 'types/store/plugins';
import {createCallContext, createCallRequest} from 'utils/apps';

type Props = {

    /*
     * Components or actions to add as channel header buttons
     */
    components?: PluginComponent[];

    /*
     * Set to true if the plug is in the dropdown
     */
    isDropdown: boolean;
    channel: Channel;
    channelMember?: ChannelMembership;

    /*
     * Logged in user's theme
     */
    theme: Theme;
    appBindings: AppBinding[];
    appsEnabled: boolean;
    intl: IntlShape;
    actions: {
        doAppCall: (call: AppCallRequest, type: AppCallType, intl: IntlShape) => Promise<ActionResult>;
        openAppsModal: (form: AppForm, call: AppCallRequest) => void;
    };
}

class MobileChannelHeaderPlug extends React.PureComponent<Props> {
    createAppButton = (binding: AppBinding) => {
        const onClick = () => this.fireAppAction(binding);

        if (this.props.isDropdown) {
            return (
                <li
                    key={'mobileChannelHeaderItem' + binding.app_id + binding.location}
                    role='presentation'
                    className='MenuItem'
                >
                    <a
                        role='menuitem'
                        href='#'
                        onClick={onClick}
                    >
                        {binding.label}
                    </a>
                </li>
            );
        }

        return (
            <li className='flex-parent--center'>
                <button
                    className='navbar-toggle navbar-right__icon'
                    onClick={onClick}
                >
                    <span className='icon navbar-plugin-button'>
                        <img
                            src={binding.icon}
                            width='16'
                            height='16'
                        />
                    </span>
                </button>
            </li>
        );
    }
    createButton = (plug: PluginComponent) => {
        const onClick = () => this.fireAction(plug);

        if (this.props.isDropdown) {
            return (
                <li
                    key={'mobileChannelHeaderItem' + plug.id}
                    role='presentation'
                    className='MenuItem'
                >
                    <a
                        role='menuitem'
                        href='#'
                        onClick={onClick}
                    >
                        {plug.dropdownText}
                    </a>
                </li>
            );
        }

        return (
            <li className='flex-parent--center'>
                <button
                    className='navbar-toggle navbar-right__icon'
                    onClick={onClick}
                >
                    <span className='icon navbar-plugin-button'>
                        {plug.icon}
                    </span>
                </button>
            </li>
        );
    }

    createList(plugs: PluginComponent[]) {
        return plugs.map(this.createButton);
    }

    createAppList(bindings: AppBinding[]) {
        return bindings.map(this.createAppButton);
    }

    fireAction(plug: PluginComponent) {
        return plug.action?.(this.props.channel, this.props.channelMember);
    }

    fireAppAction = async (binding: AppBinding) => {
        const call = binding.form?.call || binding.call;
        if (!call) {
            return;
        }

        const context = createCallContext(
            binding.app_id,
            binding.location,
            this.props.channel.id,
            this.props.channel.team_id,
        );
        const callRequest = createCallRequest(call, context);

        if (binding.form) {
            this.props.actions.openAppsModal(binding.form, callRequest);
            return;
        }
        const res = await this.props.actions.doAppCall(callRequest, AppCallTypes.SUBMIT, this.props.intl);

        const callResp = (res as {data: AppCallResponse}).data;
        const ephemeral = (message: string) => sendEphemeralPost(message, this.props.channel.id, '', callResp.app_metadata?.bot_user_id);
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                ephemeral(callResp.markdown);
            }
            break;
        case AppCallResponseTypes.ERROR: {
            const errorMessage = callResp.error || this.props.intl.formatMessage({id: 'apps.error.unknown', defaultMessage: 'Unknown error happened'});
            ephemeral(errorMessage);
            break;
        }
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.FORM:
            break;
        default: {
            const errorMessage = this.props.intl.formatMessage(
                {id: 'apps.error.responses.unknown_type', defaultMessage: 'App response type not supported. Response type: {type}.'},
                {type: callResp.type},
            );
            ephemeral(errorMessage);
        }
        }
    }

    render() {
        const components = this.props.components || [];
        const bindings = this.props.appBindings || [];

        if (components.length === 0 && bindings.length === 0) {
            return null;
        } else if (components.length === 1 && bindings.length === 0) {
            return this.createButton(components[0]);
        } else if (components.length === 0 && bindings.length === 1) {
            return this.createAppButton(bindings[0]);
        }

        if (!this.props.isDropdown) {
            return null;
        }

        const plugItems = this.createList(components);
        const appItems = this.createAppList(bindings);
        return (<>
            {plugItems}
            {appItems}
        </>);
    }
}

export default injectIntl(MobileChannelHeaderPlug);
