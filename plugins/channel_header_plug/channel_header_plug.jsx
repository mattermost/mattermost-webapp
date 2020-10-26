// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/no-multi-comp */

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown, Tooltip} from 'react-bootstrap';
import {RootCloseWrapper} from 'react-overlays';
import {FormattedMessage} from 'react-intl';

import {doPluginCall} from 'actions/plugins';
import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import PluginChannelHeaderIcon from '../../components/widgets/icons/plugin_channel_header_icon';
import {Constants} from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';

class CustomMenu extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        children: PropTypes.node,
        onClose: PropTypes.func.isRequired,
        rootCloseEvent: PropTypes.oneOf(['click', 'mousedown']),
        actions: PropTypes.shape({
            executeCommand: PropTypes.func.isRequired
        }).isRequired
    }

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

class CustomToggle extends React.PureComponent {
    static propTypes = {
        children: PropTypes.element,
        dropdownOpen: PropTypes.bool,
        onClick: PropTypes.func,
    }

    handleClick = (e) => {
        this.props.onClick(e);
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

export default class ChannelHeaderPlug extends React.PureComponent {
    static propTypes = {

        /*
         * Components or actions to add as channel header buttons
         */
        components: PropTypes.array,
        locations: PropTypes.array,

        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
        };
    }

    toggleDropdown = (dropdownOpen) => {
        this.setState({dropdownOpen});
    }

    onClose = () => {
        this.toggleDropdown(false);
    }

    fireActionAndClose = (action) => {
        action(this.props.channel, this.props.channelMember);
        this.onClose();
    }

    createComponentButton = (plug) => {
        return (
            <HeaderIconWrapper
                key={'channelHeaderButton' + plug.id}
                buttonClass='channel-header__icon'
                iconComponent={plug.icon}
                onClick={() => plug.action(this.props.channel, this.props.channelMember)}
                buttonId={plug.id}
                tooltipKey={'plugin'}
                tooltipText={plug.tooltipText ? plug.tooltipText : plug.dropdownText}
            />
        );
    }

    onClick = async (plugAction) => {
        const response = await doPluginCall({
            form_url: plugAction.form_url,
            context: {
                app_id: plugAction.app_id,
                team_id: this.props.channel.team_id,
                channel_id: this.props.channel.id,
            },
            from: [
                {
                    plugAction,
                },
            ],
        });
        if (response.type === 'command') {
            response.data.args.command = response.data.command;
            this.props.actions.executeCommand(response.data.command, response.data.args);
            return
        }
    }

    createActionButton = (plugAction) => {
        return (
            <HeaderIconWrapper
                key={'channelHeaderButton' + plugAction.location_id}
                buttonClass='channel-header__icon style--none'
                iconComponent={(
                    <img
                        src={plugAction.icon}
                        width='24'
                        height='24'
                    />
                )}
                onClick={() => this.onClick(plugAction)}
                buttonId={plugAction.location_id}
                tooltipKey={'plugin'}
                tooltipText={plugAction.aria_text}
            />
        );
    }

    createDropdown = (plugs, locations) => {
        const componentItems = plugs.map((plug) => {
            return (
                <li
                    key={'channelHeaderPlug' + plug.id}
                >
                    <a
                        href='#'
                        className='d-flex align-items-center'
                        onClick={() => this.fireActionAndClose(plug.action)}
                    >
                        <span className='d-flex align-items-center overflow--ellipsis'>{plug.icon}</span>
                        <span>{plug.dropdownText}</span>
                    </a>
                </li>
            );
        });

        const items = componentItems.concat(locations.map((plug) => {
            return (
                <li
                    key={'channelHeaderPlug' + plug.app_id + plug.location_id}
                >
                    <a
                        href='#'
                        className='d-flex align-items-center'
                        onClick={() => this.fireActionAndClose(() => doPluginCall({
                            form_url: plug.form_url,
                            context: {
                                app_id: plug.app_id,
                                team_id: this.props.channel.team_id,
                                channel_id: this.props.channel.id,
                            },
                            from: [
                                {
                                    plug,
                                },
                            ],
                        }))}
                    >
                        <span className='d-flex align-items-center overflow--ellipsis'>{(<img src={plug.icon}/>)}</span>
                        <span>{plug.text}</span>
                    </a>
                </li>
            );
        }));

        return (
            <div className='flex-child'>
                <Dropdown
                    id='channelHeaderPlugDropdown'
                    onToggle={this.toggleDropdown}
                    onSelect={this.onSelect}
                    open={this.state.dropdownOpen}
                >
                    <CustomToggle
                        dropdownOpen={this.state.dropdownOpen}
                        bsRole='toggle'
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
                                    {plugs.length}
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
        const locations = this.props.locations || [];

        if (components.length === 0 && locations.length === 0) {
            return null;
        } else if (components.length + locations.length <= 5) {
            const componentButtons = components.map(this.createComponentButton);
            return componentButtons.concat(locations.map(this.createActionButton));
        }

        return this.createDropdown(components, locations);
    }
}

/* eslint-enable react/no-multi-comp */
