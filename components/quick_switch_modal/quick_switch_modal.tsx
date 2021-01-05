// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Channel} from 'mattermost-redux/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent';
import {t} from 'utils/i18n';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import SwitchTeamProvider from 'components/suggestion/switch_team_provider.jsx';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';

import {NoResultsVariant} from 'components/no_results_indicator/types';

const CHANNEL_MODE = 'channel';
const TEAM_MODE = 'team';

type ProviderSuggestions = {
    matchedPretext: any;
    terms: string[];
    items: any[];
    component: React.ReactNode;
}

export type Props = {

    /**
     * The function called to hide the modal
     */
    onHide: () => void;

    /**
     * Set to show team switcher
     */
    showTeamSwitcher: boolean;
    actions: {
        joinChannelById: (channelId: string) => Promise<ActionResult>;
        switchToChannel: (channel: Channel) => Promise<ActionResult>;
    };
}

type State = {
    text: string;
    mode: string|null;
    hasSuggestions: boolean;
    shouldShowLoadingSpinner: boolean;
    pretext: string;
}

export default class QuickSwitchModal extends React.PureComponent<Props, State> {
    private channelProviders: SwitchChannelProvider[];
    private teamProviders: SwitchTeamProvider[];
    private switchBox: SuggestionBox|null;

    constructor(props: Props) {
        super(props);

        this.channelProviders = [new SwitchChannelProvider()];
        this.teamProviders = [new SwitchTeamProvider()];

        this.switchBox = null;

        this.state = {
            text: '',
            mode: CHANNEL_MODE,
            hasSuggestions: true,
            shouldShowLoadingSpinner: true,
            pretext: '',
        };
    }

    private focusTextbox = (): void => {
        if (this.switchBox === null) {
            return;
        }

        const textbox = this.switchBox.getTextbox();
        if (document.activeElement !== textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);
        }
    };

    private setSwitchBoxRef = (input: SuggestionBox): void => {
        this.switchBox = input;
        this.focusTextbox();
    };

    private onHide = (): void => {
        this.focusPostTextbox();
        this.setState({
            text: '',
        });
        this.props.onHide();
    };

    private focusPostTextbox = (): void => {
        if (!UserAgent.isMobile()) {
            setTimeout(() => {
                const textbox = document.querySelector('#post_textbox') as HTMLElement;
                if (textbox) {
                    textbox.focus();
                }
            });
        }
    };

    private onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({text: e.target.value, shouldShowLoadingSpinner: true});
    };

    private handleKeyDown = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.TAB)) {
            e.preventDefault();
            this.switchMode();
        }
    };

    public handleSubmit = async (selected?: any): Promise<void> => {
        if (!selected) {
            return;
        }

        if (this.state.mode === CHANNEL_MODE) {
            const {joinChannelById, switchToChannel} = this.props.actions;
            const selectedChannel = selected.channel;

            if (selected.type === Constants.MENTION_MORE_CHANNELS && selectedChannel.type === Constants.OPEN_CHANNEL) {
                await joinChannelById(selectedChannel.id);
            }
            switchToChannel(selectedChannel).then((result: ActionResult) => {
                if ('data' in result) {
                    this.onHide();
                }
            });
        } else {
            browserHistory.push('/' + selected.name);
            this.onHide();
        }
    };

    private enableChannelProvider = (): void => {
        this.channelProviders[0].disableDispatches = false;
        this.teamProviders[0].disableDispatches = true;
    };

    private enableTeamProvider = (): void => {
        this.teamProviders[0].disableDispatches = false;
        this.channelProviders[0].disableDispatches = true;
    };

    private switchMode = (): void => {
        if (this.state.mode === CHANNEL_MODE && this.props.showTeamSwitcher) {
            this.enableTeamProvider();
            this.setState({mode: TEAM_MODE});
        } else if (this.state.mode === TEAM_MODE) {
            this.enableChannelProvider();
            this.setState({mode: CHANNEL_MODE});
        }
    };

    private handleOnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
        e.preventDefault();
        const mode = e.currentTarget.getAttribute('data-mode');
        this.enableChannelProvider();
        this.setState({mode});
        this.focusTextbox();
    }

    private handleSuggestionsReceived = (suggestions: ProviderSuggestions): void => {
        const loadingPropPresent = suggestions.items.some((item: any) => item.loading);
        this.setState({shouldShowLoadingSpinner: loadingPropPresent,
            pretext: suggestions.matchedPretext,
            hasSuggestions: suggestions.items.length > 0});
    }

    public render = (): JSX.Element => {
        let providers: SwitchChannelProvider[]|SwitchTeamProvider[] = this.channelProviders;

        let header = (
            <h1>
                <FormattedMessage
                    id='quick_switch_modal.switchChannels'
                    defaultMessage='Switch Channels'
                />
            </h1>
        );

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
                <FormattedMarkdownMessage
                    id='quick_switch_modal.help_mobile'
                    defaultMessage='Type to find a channel.'
                />
            );
        } else if (this.props.showTeamSwitcher) {
            help = (
                <FormattedMarkdownMessage
                    id='quick_switch_modal.help'
                    defaultMessage='Start typing then use TAB to toggle channels/teams, **UP/DOWN** to browse, **ENTER** to select, and **ESC** to dismiss.'
                />
            );
        } else {
            help = (
                <FormattedMarkdownMessage
                    id='quick_switch_modal.help_no_team'
                    defaultMessage='Type to find a channel. Use **UP/DOWN** to browse, **ENTER** to select, **ESC** to dismiss.'
                />
            );
        }

        return (
            <Modal
                dialogClassName='a11y__modal channel-switcher'
                ref='modal'
                show={true}
                onHide={this.onHide}
                enforceFocus={false}
                restoreFocus={false}
                role='dialog'
                aria-labelledby='quickSwitchModalLabel'
                aria-describedby='quickSwitchHint'
                animation={false}
            >
                <Modal.Header
                    id='quickSwitchModalLabel'
                    closeButton={true}
                />
                <Modal.Body>
                    <div className='channel-switcher__header'>
                        {header}
                        <div
                            className='channel-switcher__hint'
                            id='quickSwitchHint'
                        >
                            {help}
                        </div>
                    </div>
                    <div className='channel-switcher__suggestion-box'>
                        <i className='icon icon-magnify icon-16'/>
                        <SuggestionBox
                            id='quickSwitchInput'
                            aria-label={Utils.localizeMessage('quick_switch_modal.input', 'quick switch input')}
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
                            spellCheck='false'
                            delayInputUpdate={true}
                            openWhenEmpty={true}
                            onSuggestionsReceived={this.handleSuggestionsReceived}
                            forceSuggestionsWhenBlur={true}
                        />
                        {!this.state.shouldShowLoadingSpinner && !this.state.hasSuggestions && this.state.text &&
                        <NoResultsIndicator
                            variant={NoResultsVariant.ChannelSearch}
                            titleValues={{channelName: `"${this.state.pretext}"`}}
                        />
                        }
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
/* eslint-enable react/no-string-refs */
