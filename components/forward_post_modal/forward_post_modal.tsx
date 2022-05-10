// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Post} from '@mattermost/types/posts';

import {Channel} from 'mattermost-redux/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';

import {NoResultsVariant} from 'components/no_results_indicator/types';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import SuggestionBox from 'components/suggestion/suggestion_box';
import SuggestionBoxComponent from 'components/suggestion/suggestion_box/suggestion_box';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';

// import Textbox from 'components/textbox';

type ProviderSuggestions = {
    matchedPretext: string;
    terms: string[];
    items: any[];
    component?: React.ReactNode;
}

export type Props = {

    /**
     * The function called immediately after the modal is hidden
     */
    onExited?: () => void;

    post: Post;

    isMobileView: boolean;

    actions: {
        joinChannelById: (channelId: string) => Promise<ActionResult>;
        switchToChannel: (channel: Channel) => Promise<ActionResult>;
    };
}

const ForwardPostModal = (props: Props) => {
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('Comment goes HERE!');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestionItems, setSuggestionItems] = useState<any[]>([]);
    const [matchedPretext, setMatchedPretext] = useState('');
    const channelProviders = useRef<SwitchChannelProvider[]>([new SwitchChannelProvider()]);
    const switchBoxRef = useRef<SuggestionBoxComponent>();

    const onHide = () => {
        // focusPostTextbox();
        setSearchTerm('');
        setComment('');
        props.onExited?.();
    };

    const setSwitchBoxRef = (input: SuggestionBoxComponent) => {
        switchBoxRef.current = input;
        focusTextbox();
    };

    const focusTextbox = (): void => {
        if (switchBoxRef.current === null) {
            return;
        }

        const textbox = switchBoxRef.current?.getTextbox();
        if (document.activeElement !== textbox) {
            textbox.focus();
            Utils.placeCaretAtEnd(textbox);
        }
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
        setLoading(true);
    };

    const handleSubmit = async (selected?: any): Promise<void> => {
        if (!selected) {
            return;
        }

        const {joinChannelById, switchToChannel} = props.actions;
        const selectedChannel = selected.channel;

        if (selected.type === Constants.MENTION_MORE_CHANNELS && selectedChannel.type === Constants.OPEN_CHANNEL) {
            await joinChannelById(selectedChannel.id);
        }

        switchToChannel(selectedChannel).then((result: ActionResult) => {
            if ('data' in result) {
                onHide();
            }
        });
    };

    const handleSuggestionsReceived = (suggestions: ProviderSuggestions): void => {
        const loadingPropPresent = suggestions.items.some((item: any) => item.loading);
        setLoading(loadingPropPresent);
        setMatchedPretext(suggestions.matchedPretext);
        setSuggestionItems(suggestions.items);
    };

    const header = (
        <h1>
            <FormattedMessage
                id='quick_switch_modal.switchChannels'
                defaultMessage='Find Channels'
            />
        </h1>
    );

    const help = props.isMobileView ? (
        <FormattedMarkdownMessage
            id='quick_switch_modal.help_mobile'
            defaultMessage='Type to find a channel.'
        />
    ) : (
        <FormattedMarkdownMessage
            id='quick_switch_modal.help_no_team'
            defaultMessage='Type to find a channel. Use **UP/DOWN** to browse, **ENTER** to select, **ESC** to dismiss.'
        />
    );

    return (
        <Modal
            dialogClassName='a11y__modal forward-post'
            show={true}
            onHide={onHide}
            enforceFocus={false}
            restoreFocus={false}
            role='dialog'
            aria-labelledby='forwardPostModalLabel'
            aria-describedby='forwardPostModalHint'
            animation={true}
        >
            <Modal.Header
                id='forwardPostModalLabel'
                closeButton={true}
            />
            <Modal.Body>
                <div className='forward-post__header'>
                    {header}
                    <div
                        className='forward-post__hint'
                        id='quickSwitchHint'
                    >
                        {help}
                    </div>
                </div>
                <div className='forward-post__suggestion-box'>
                    <i className='icon icon-magnify icon-16'/>
                    <SuggestionBox
                        id='forwardPostInput'
                        aria-label={Utils.localizeMessage('quick_switch_modal.input', 'quick switch input')}
                        ref={setSwitchBoxRef}
                        className='form-control focused'
                        onChange={onSearchChange}
                        value={searchTerm}
                        onItemSelected={handleSubmit}
                        listComponent={SuggestionList}
                        listPosition='bottom'
                        maxLength='64'
                        providers={channelProviders.current}
                        completeOnTab={false}
                        spellCheck='false'
                        delayInputUpdate={true}
                        openWhenEmpty={true}
                        onSuggestionsReceived={handleSuggestionsReceived}
                        forceSuggestionsWhenBlur={true}
                        renderDividers={[Constants.MENTION_UNREAD, Constants.MENTION_RECENT_CHANNELS]}
                        shouldSearchCompleteText={true}
                    />
                    {!loading && suggestionItems.length <= 0 && searchTerm && (
                        <NoResultsIndicator
                            variant={NoResultsVariant.ChannelSearch}
                            titleValues={{channelName: `"${matchedPretext}"`}}
                        />
                    )}
                </div>
                <div className='forward-post__comment-box'>
                    {comment}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ForwardPostModal;
