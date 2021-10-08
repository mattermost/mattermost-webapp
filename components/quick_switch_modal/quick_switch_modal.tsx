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
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';

import {NoResultsVariant} from 'components/no_results_indicator/types';

const CHANNEL_MODE = 'channel';

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
    private switchBox: SuggestionBox|null;

    constructor(props: Props) {
        super(props);

        this.channelProviders = [new SwitchChannelProvider()];

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

    private handleSuggestionsReceived = (suggestions: ProviderSuggestions): void => {
        const loadingPropPresent = suggestions.items.some((item: any) => item.loading);
        this.setState({
            shouldShowLoadingSpinner: loadingPropPresent,
            pretext: suggestions.matchedPretext,
            hasSuggestions: suggestions.items.length > 0,
        });
    }

    public render = (): JSX.Element => {
        const providers: SwitchChannelProvider[] = this.channelProviders;

        const header = (
            <h1>
                <FormattedMessage
                    id='quick_switch_modal.switchChannels'
                    defaultMessage='Switch Channels'
                />
            </h1>
        );

        let help;
        if (Utils.isMobile()) {
            help = (
                <FormattedMarkdownMessage
                    id='quick_switch_modal.help_mobile'
                    defaultMessage='Type to find a channel.'
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
                            onItemSelected={this.handleSubmit}
                            listComponent={SuggestionList}
                            listPosition='bottom'
                            maxLength='64'
                            providers={providers}
                            completeOnTab={false}
                            spellCheck='false'
                            delayInputUpdate={true}
                            openWhenEmpty={true}
                            onSuggestionsReceived={this.handleSuggestionsReceived}
                            forceSuggestionsWhenBlur={true}
                            renderDividers={true}
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
