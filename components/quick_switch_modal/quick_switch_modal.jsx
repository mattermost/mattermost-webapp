// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {goToChannel, openDirectChannelToUser} from 'actions/channel_actions.jsx';
import store from 'stores/redux_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import SwitchTeamProvider from 'components/suggestion/switch_team_provider.jsx';

const getState = store.getState;

const CHANNEL_MODE = 'channel';
const TEAM_MODE = 'team';

export default class QuickSwitchModal extends React.PureComponent {
    static propTypes = {

        /**
         * The mode to start in when showing the modal, either 'channel' or 'team'
         */
        initialMode: PropTypes.string.isRequired,

        /**
         * Set to show the modal
         */
        show: PropTypes.bool.isRequired,

        /**
         * The function called to hide the modal
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Set to show team switcher
         */
        showTeamSwitcher: PropTypes.bool
    }

    static defaultProps = {
        initialMode: CHANNEL_MODE
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onShow = this.onShow.bind(this);
        this.onHide = this.onHide.bind(this);
        this.onExited = this.onExited.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.switchToChannel = this.switchToChannel.bind(this);
        this.switchMode = this.switchMode.bind(this);
        this.focusTextbox = this.focusTextbox.bind(this);

        this.enableChannelProvider = this.enableChannelProvider.bind(this);
        this.enableTeamProvider = this.enableTeamProvider.bind(this);
        this.channelProviders = [new SwitchChannelProvider()];
        this.teamProviders = [new SwitchTeamProvider()];

        this.switchBox = null;

        this.state = {
            text: '',
            mode: props.initialMode
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.show && nextProps.show) {
            this.setState({mode: nextProps.initialMode, text: ''});
        }
    }

    focusTextbox() {
        if (this.switchBox == null) {
            return;
        }

        const textbox = this.switchBox.getTextbox();
        if (document.activeElement !== textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);
        }
    }

    setSwitchBoxRef = (input) => {
        this.switchBox = input;
        this.focusTextbox();
    }

    onShow() {
        this.setState({
            text: ''
        });
    }

    onHide() {
        this.setState({
            text: ''
        });
        this.props.onHide();
    }

    onExited() {
        if (!UserAgent.isMobile()) {
            setTimeout(() => {
                const textbox = document.querySelector('#post_textbox');
                if (textbox) {
                    textbox.focus();
                }
            });
        }
    }

    onChange(e) {
        this.setState({text: e.target.value});
    }

    handleKeyDown(e) {
        if (e.keyCode === Constants.KeyCodes.TAB) {
            e.preventDefault();
            this.switchMode();
        }
    }

    handleSubmit(selected) {
        let channel = null;

        if (!selected) {
            return;
        }

        if (this.state.mode === CHANNEL_MODE) {
            const selectedChannel = selected.channel;
            if (selectedChannel.type === Constants.DM_CHANNEL) {
                openDirectChannelToUser(
                    selectedChannel.id,
                    (ch) => {
                        channel = ch;
                        this.switchToChannel(channel);
                    },
                    () => {
                        channel = null;
                        this.switchToChannel(channel);
                    }
                );
            } else if (selectedChannel.type === Constants.GM_CHANNEL) {
                channel = getChannel(getState(), selectedChannel.id);
                this.switchToChannel(channel);
            } else {
                this.switchToChannel(selectedChannel);
            }
        } else {
            browserHistory.push('/' + selected.name);
            this.onHide();
        }
    }

    switchToChannel(channel) {
        if (channel != null) {
            goToChannel(channel);
            this.onHide();
        }
    }

    enableChannelProvider() {
        this.channelProviders[0].disableDispatches = false;
        this.teamProviders[0].disableDispatches = true;
    }

    enableTeamProvider() {
        this.teamProviders[0].disableDispatches = false;
        this.channelProviders[0].disableDispatches = true;
    }

    switchMode() {
        if (this.state.mode === CHANNEL_MODE && this.props.showTeamSwitcher) {
            this.enableTeamProvider();
            this.setState({mode: TEAM_MODE});
        } else if (this.state.mode === TEAM_MODE) {
            this.enableChannelProvider();
            this.setState({mode: CHANNEL_MODE});
        }
    }

    handleOnClick = (e) => {
        e.preventDefault();
        const mode = e.currentTarget.getAttribute('data-mode');
        this.enableChannelProvider();
        this.setState({mode});
        this.focusTextbox();
    }

    render() {
        let providers = this.channelProviders;
        let header;
        let renderDividers = true;

        let channelShortcut = 'quick_switch_modal.channelsShortcut.windows';
        let defaultChannelShortcut = 'CTRL+K';
        if (Utils.isMac()) {
            channelShortcut = 'quick_switch_modal.channelsShortcut.mac';
            defaultChannelShortcut = 'CMD+K';
        }

        let teamShortcut = 'quick_switch_modal.teamsShortcut.windows';
        let defaultTeamShortcut = 'CTRL+ALT+K';
        if (Utils.isMac()) {
            teamShortcut = 'quick_switch_modal.teamsShortcut.mac';
            defaultTeamShortcut = 'CMD+ALT+K';
        }

        if (this.props.showTeamSwitcher) {
            let channelsActiveClass = '';
            let teamsActiveClass = '';
            if (this.state.mode === TEAM_MODE) {
                providers = this.teamProviders;
                renderDividers = false;
                teamsActiveClass = 'active';
            } else {
                channelsActiveClass = 'active';
            }

            header = (
                <div className='nav nav-tabs'>
                    <li className={channelsActiveClass}>
                        <a
                            data-mode={'channel'}
                            href='#'
                            onClick={this.handleOnClick}
                        >
                            <FormattedMessage
                                id='quick_switch_modal.channels'
                                defaultMessage='Channels'
                            />
                            <span className='small'>
                                <FormattedMessage
                                    id={channelShortcut}
                                    defaultMessage={defaultChannelShortcut}
                                />
                            </span>
                        </a>
                    </li>
                    <li className={teamsActiveClass}>
                        <a
                            data-mode={'team'}
                            href='#'
                            onClick={this.handleOnClick}
                        >
                            <FormattedMessage
                                id='quick_switch_modal.teams'
                                defaultMessage='Teams'
                            />
                            <span className='small'>
                                <FormattedMessage
                                    id={teamShortcut}
                                    defaultMessage={defaultTeamShortcut}
                                />
                            </span>
                        </a>
                    </li>
                </div>
            );
        }

        let help;
        if (Utils.isMobile()) {
            help = (
                <FormattedMessage
                    id='quick_switch_modal.help_mobile'
                    defaultMessage='Type to find a channel.'
                />
            );
        } else if (this.props.showTeamSwitcher) {
            help = (
                <FormattedMessage
                    id='quick_switch_modal.help'
                    defaultMessage='Start typing then use TAB to toggle channels/teams, ↑↓ to browse, ↵ to select, and ESC to dismiss.'
                />
            );
        } else {
            help = (
                <FormattedMessage
                    id='quick_switch_modal.help_no_team'
                    defaultMessage='Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.'
                />
            );
        }

        return (
            <Modal
                dialogClassName='channel-switch-modal modal--overflow'
                ref='modal'
                show={this.props.show}
                onHide={this.onHide}
                onExited={this.onExited}
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    {header}
                    <div className='modal__hint'>
                        {help}
                    </div>
                    <SuggestionBox
                        ref={this.setSwitchBoxRef}
                        className='form-control focused'
                        type='input'
                        onChange={this.onChange}
                        value={this.state.text}
                        onKeyDown={this.handleKeyDown}
                        onItemSelected={this.handleSubmit}
                        listComponent={SuggestionList}
                        maxLength='64'
                        providers={providers}
                        listStyle='bottom'
                        completeOnTab={false}
                        renderDividers={renderDividers}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
