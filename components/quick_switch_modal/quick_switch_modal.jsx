// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import {t} from 'utils/i18n';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import SwitchTeamProvider from 'components/suggestion/switch_team_provider.jsx';

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
        showTeamSwitcher: PropTypes.bool,

        actions: PropTypes.shape({
            switchToChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        initialMode: CHANNEL_MODE,
    }

    constructor(props) {
        super(props);

        this.channelProviders = [new SwitchChannelProvider()];
        this.teamProviders = [new SwitchTeamProvider()];

        this.switchBox = null;

        this.state = {
            text: '',
            mode: props.initialMode,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!this.props.show && nextProps.show) {
            this.setState({mode: nextProps.initialMode, text: ''});
        }
    }

    focusTextbox = () => {
        if (this.switchBox == null) {
            return;
        }

        const textbox = this.switchBox.getTextbox();
        if (document.activeElement !== textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);
        }
    };

    setSwitchBoxRef = (input) => {
        this.switchBox = input;
        this.focusTextbox();
    }

    onShow = () => {
        this.setState({
            text: '',
        });
    };

    onHide = () => {
        this.focusPostTextbox();
        this.setState({
            text: '',
        });
        this.props.onHide();
    };

    focusPostTextbox = () => {
        if (!UserAgent.isMobile()) {
            setTimeout(() => {
                const textbox = document.querySelector('#post_textbox');
                if (textbox) {
                    textbox.focus();
                }
            });
        }
    }

    onChange = (e) => {
        this.setState({text: e.target.value});
    };

    handleKeyDown = (e) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.TAB)) {
            e.preventDefault();
            this.switchMode();
        }
    };

    handleSubmit = (selected) => {
        if (!selected) {
            return;
        }

        if (this.state.mode === CHANNEL_MODE) {
            const selectedChannel = selected.channel;
            this.props.actions.switchToChannel(selectedChannel).then((result) => {
                if (result.data) {
                    this.onHide();
                }
            });
        } else {
            browserHistory.push('/' + selected.name);
            this.onHide();
        }
    };

    enableChannelProvider = () => {
        this.channelProviders[0].disableDispatches = false;
        this.teamProviders[0].disableDispatches = true;
    };

    enableTeamProvider = () => {
        this.teamProviders[0].disableDispatches = false;
        this.channelProviders[0].disableDispatches = true;
    };

    switchMode = () => {
        if (this.state.mode === CHANNEL_MODE && this.props.showTeamSwitcher) {
            this.enableTeamProvider();
            this.setState({mode: TEAM_MODE});
        } else if (this.state.mode === TEAM_MODE) {
            this.enableChannelProvider();
            this.setState({mode: CHANNEL_MODE});
        }
    };

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

        let channelShortcut = t('quick_switch_modal.channelsShortcut.windows');
        let defaultChannelShortcut = 'CTRL+K';
        if (Utils.isMac()) {
            channelShortcut = t('quick_switch_modal.channelsShortcut.mac');
            defaultChannelShortcut = 'CMD+K';
        }

        let teamShortcut = t('quick_switch_modal.teamsShortcut.windows');
        let defaultTeamShortcut = 'CTRL+ALT+K';
        if (Utils.isMac()) {
            teamShortcut = t('quick_switch_modal.teamsShortcut.mac');
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
                enforceFocus={false}
                restoreFocus={false}
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
                        delayInputUpdate={true}
                        openWhenEmpty={true}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
