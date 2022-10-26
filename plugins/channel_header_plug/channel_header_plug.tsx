// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/no-multi-comp */

import React from 'react';
import {Dropdown, Tooltip} from 'react-bootstrap';
import {RootCloseWrapper} from 'react-overlays';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {Channel, ChannelMembership} from '@mattermost/types/channels';
import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {AppBinding} from '@mattermost/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {HandleBindingClick, OpenAppsModal, PostEphemeralCallResponseForChannel} from 'types/apps';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import PluginChannelHeaderIcon from 'components/widgets/icons/plugin_channel_header_icon';
import OverlayTrigger from 'components/overlay_trigger';

import {PluginComponent} from 'types/store/plugins';

import {createCallContext} from 'utils/apps';
import {Constants} from 'utils/constants';

type CustomMenuProps = {
    open?: boolean;
    children?: React.ReactNode;
    onClose: () => void;
    rootCloseEvent?: 'click' | 'mousedown';
    bsRole: string;
}

class CustomMenu extends React.PureComponent<CustomMenuProps> {
    handleRootClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            open,
            rootCloseEvent,
            children,
        } = this.props;

        return (
            <RootCloseWrapper
                disabled={!open}
                onRootClose={this.handleRootClose}
                event={rootCloseEvent}
            >
                <ul
                    role='menu'
                    className='dropdown-menu channel-header_plugin-dropdown'
                >
                    {children}
                </ul>
            </RootCloseWrapper>
        );
    }
}

type CustomToggleProps = {
    children?: React.ReactNode;
    dropdownOpen?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    bsRole: string;
}

class CustomToggle extends React.PureComponent<CustomToggleProps> {
    handleClick = (e: React.MouseEvent) => {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    render() {
        const {children} = this.props;

        let activeClass = '';
        if (this.props.dropdownOpen) {
            activeClass = ' channel-header__icon--active';
        }

        return (
            <button
                id='pluginChannelHeaderButtonDropdown'
                className={'channel-header__icon channel-header__icon--wide ' + activeClass}
                type='button'
                onClick={this.handleClick}
            >
                {children}
            </button>
        );
    }
}

type ChannelHeaderPlugProps = {
    intl: IntlShape;
    components: PluginComponent[];
    appBindings?: AppBinding[];
    appsEnabled: boolean;
    channel: Channel;
    channelMember?: ChannelMembership;
    theme: Theme;
    sidebarOpen: boolean;
    shouldShowAppBar: boolean;
    actions: {
        handleBindingClick: HandleBindingClick;
        postEphemeralCallResponseForChannel: PostEphemeralCallResponseForChannel;
        openAppsModal: OpenAppsModal;
    };
}

type ChannelHeaderPlugState = {
    dropdownOpen: boolean;
}

class ChannelHeaderPlug extends React.PureComponent<ChannelHeaderPlugProps, ChannelHeaderPlugState> {
    public static defaultProps: Partial<ChannelHeaderPlugProps> = {
        components: [],
        appBindings: [],
    }

    private disableButtonsClosingRHS = false;

    constructor(props: ChannelHeaderPlugProps) {
        super(props);
        this.state = {
            dropdownOpen: false,
        };
    }

    componentDidUpdate(prevProps: ChannelHeaderPlugProps) {
        if (prevProps.sidebarOpen && !this.props.sidebarOpen) {
            this.disableButtonsClosingRHS = true;

            setTimeout(() => {
                this.disableButtonsClosingRHS = false;
            }, Constants.CHANNEL_HEADER_BUTTON_DISABLE_TIMEOUT);
        }
    }

    toggleDropdown = (dropdownOpen: boolean) => {
        this.setState({dropdownOpen});
    }

    onClose = () => {
        this.toggleDropdown(false);
    }

    fireAction = (action: (channel: Channel, channelMember?: ChannelMembership) => void) => {
        if (this.disableButtonsClosingRHS) {
            return;
        }

        action(this.props.channel, this.props.channelMember);
    }

    fireActionAndClose = (action: (channel: Channel, channelMember?: ChannelMembership) => void) => {
        action(this.props.channel, this.props.channelMember);
        this.onClose();
    }

    createComponentButton = (plug: PluginComponent) => {
        return (
            <HeaderIconWrapper
                key={'channelHeaderButton' + plug.id}
                buttonClass='channel-header__icon'
                iconComponent={plug.icon!}
                onClick={() => this.fireAction(plug.action!)}
                buttonId={plug.id}
                tooltipKey={'plugin'}
                tooltipText={plug.tooltipText ? plug.tooltipText : plug.dropdownText}
                pluginId={plug.pluginId}
            />
        );
    }

    onBindingClick = async (binding: AppBinding) => {
        if (this.disableButtonsClosingRHS) {
            return;
        }

        const {channel, intl} = this.props;

        const context = createCallContext(
            binding.app_id,
            binding.location,
            this.props.channel.id,
            this.props.channel.team_id,
        );

        const res = await this.props.actions.handleBindingClick(binding, context, intl);

        if (res.error) {
            const errorResponse = res.error;
            const errorMessage = errorResponse.text || intl.formatMessage({
                id: 'apps.error.unknown',
                defaultMessage: 'Unknown error occurred.',
            });
            this.props.actions.postEphemeralCallResponseForChannel(errorResponse, errorMessage, channel.id);
            return;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.text) {
                this.props.actions.postEphemeralCallResponseForChannel(callResp, callResp.text, channel.id);
            }
            break;
        case AppCallResponseTypes.NAVIGATE:
            break;
        case AppCallResponseTypes.FORM:
            if (callResp.form) {
                this.props.actions.openAppsModal(callResp.form, context);
            }
            break;
        default: {
            const errorMessage = this.props.intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            });
            this.props.actions.postEphemeralCallResponseForChannel(callResp, errorMessage, channel.id);
        }
        }
    }

    createAppBindingButton = (binding: AppBinding) => {
        return (
            <HeaderIconWrapper
                key={`channelHeaderButton_${binding.app_id}_${binding.location}`}
                buttonClass='channel-header__icon style--none'
                iconComponent={(
                    <img
                        src={binding.icon}
                        width='24'
                        height='24'
                    />
                )}
                onClick={() => this.onBindingClick(binding)}
                buttonId={`${binding.app_id}_${binding.location}`}
                tooltipKey={'plugin'}
                tooltipText={binding.label}
            />
        );
    }

    createDropdown = (plugs: PluginComponent[], appBindings: AppBinding[]) => {
        const componentItems = plugs.filter((plug) => plug.action).map((plug) => {
            return (
                <li
                    key={'channelHeaderPlug' + plug.id}
                >
                    <a
                        href='#'
                        className='d-flex align-items-center'
                        onClick={() => this.fireActionAndClose(plug.action!)}
                    >
                        <span className='d-flex align-items-center overflow--ellipsis'>{plug.icon}</span>
                        <span>{plug.dropdownText}</span>
                    </a>
                </li>
            );
        });

        let items = componentItems;
        if (this.props.appsEnabled) {
            items = componentItems.concat(appBindings.map((binding) => {
                return (
                    <li
                        key={'channelHeaderPlug' + binding.app_id + binding.location}
                    >
                        <a
                            href='#'
                            className='d-flex align-items-center'
                            onClick={() => this.fireActionAndClose(() => this.onBindingClick(binding))}
                        >
                            <span className='d-flex align-items-center overflow--ellipsis icon'>{(<img src={binding.icon}/>)}</span>
                            <span>{binding.label}</span>
                        </a>
                    </li>
                );
            }));
        }

        return (
            <div className='flex-child'>
                <Dropdown
                    id='channelHeaderPlugDropdown'
                    onToggle={this.toggleDropdown}
                    open={this.state.dropdownOpen}
                >
                    <CustomToggle
                        bsRole='toggle'
                        dropdownOpen={this.state.dropdownOpen}
                    >
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={this.state.dropdownOpen ? <></> : (
                                <Tooltip id='removeIcon'>
                                    <div aria-hidden={true}>
                                        <FormattedMessage
                                            id='generic_icons.plugins'
                                            defaultMessage='Plugins'
                                        />
                                    </div>
                                </Tooltip>
                            )}
                        >
                            <React.Fragment>
                                <PluginChannelHeaderIcon
                                    id='pluginChannelHeaderIcon'
                                    className='icon icon--standard icon__pluginChannelHeader'
                                    aria-hidden='true'
                                />
                                <span
                                    id='pluginCount'
                                    className='icon__text'
                                >
                                    {items.length}
                                </span>
                            </React.Fragment>
                        </OverlayTrigger>
                    </CustomToggle>
                    <CustomMenu
                        bsRole='menu'
                        open={this.state.dropdownOpen}
                        onClose={this.onClose}
                    >
                        {items}
                    </CustomMenu>
                </Dropdown>
            </div>
        );
    }

    render() {
        const components = this.props.components || [];
        const appBindings = this.props.appsEnabled ? this.props.appBindings || [] : [];
        if (this.props.shouldShowAppBar || (components.length === 0 && appBindings.length === 0)) {
            return null;
        } else if ((components.length + appBindings.length) <= 15) {
            let componentButtons = components.filter((plug) => plug.icon && plug.action).map(this.createComponentButton);
            if (this.props.appsEnabled) {
                componentButtons = componentButtons.concat(appBindings.map(this.createAppBindingButton));
            }
            return componentButtons;
        }

        return this.createDropdown(components, appBindings);
    }
}

export default injectIntl(ChannelHeaderPlug);
/* eslint-enable react/no-multi-comp */
