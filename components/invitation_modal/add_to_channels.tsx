// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {Channel} from 'mattermost-redux/types/channels';

import CloseCircleIcon from 'components/widgets/icons/close_circle_icon';
import ChannelsInput from 'components/widgets/inputs/channels_input';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './add_to_channels.scss';

export type CustomMessageProps = {
    message: string;
    open: boolean;
}

export const defaultInviteChannels = deepFreeze({
    channels: [],
    search: '',
});

export type InviteChannels = {
    channels: Channel[];
    search: string;
}

export const defaultCustomMessage = deepFreeze({
    message: '',
    open: false,
});

export type Props = {
    customMessage: CustomMessageProps;
    toggleCustomMessage: () => void;
    setCustomMessage: (message: string) => void;
    inviteChannels: InviteChannels;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (search: string) => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    currentChannelName: string;
    titleClass?: string;
}

const RENDER_TIMEOUT_GUESS = 100;

export default function AddToChannels(props: Props) {
    useEffect(() => {
        if (props.customMessage.open) {
            setTimeout(() => {
                document.getElementById('invite-members-to-channels')?.focus();
            }, RENDER_TIMEOUT_GUESS);
        }
    }, [props.customMessage.open]);

    const {formatMessage} = useIntl();

    return (<div className='AddToChannels'>
        <div className='InviteView__sectionTitle'>
            <FormattedMessage
                id='invite_modal.add_channels_title_a'
                defaultMessage='Add to channels'
            />
            {' '}
            <span className='InviteView__sectionTitleParenthetical'>
                <FormattedMarkdownMessage
                    id='invite_modal.add_channels_title_b'
                    defaultMessage='**(required)**'
                />
            </span>
        </div>
        <ChannelsInput
            placeholder={
                <FormattedMessage
                    id='invite_modal.example_channel'
                    defaultMessage='e.g. {channel_name}'
                    values={{
                        channel_name: props.currentChannelName,
                    }}
                />
            }
            ariaLabel={formatMessage({
                id: 'invitation_modal.guests.add_channels.title',
                defaultMessage: 'Search and Add Channels',
            })}
            channelsLoader={props.channelsLoader}
            onChange={props.onChannelsChange}
            onInputChange={props.onChannelsInputChange}
            inputValue={props.inviteChannels.search}
            value={props.inviteChannels.channels}
        />
        <div
            className='AddToChannels__customMessage'
            data-testid='customMessage'
        >
            {!props.customMessage.open && (
                <div className={'AddToChannels__customMessageTitle ' + props.titleClass}>
                    <a
                        onClick={props.toggleCustomMessage}
                        href='#'
                    >
                        <FormattedMessage
                            id='invitation_modal.guests.custom-message.link'
                            defaultMessage='Set a custom message'
                        />
                    </a>
                </div>
            )}
            {props.customMessage.open && (
                <React.Fragment>
                    <div className={'AddToChannels__customMessageTitle ' + props.titleClass}>
                        <FormattedMessage
                            id='invitation_modal.guests.custom-message.title'
                            defaultMessage='Custom message'
                        />
                        <CloseCircleIcon
                            onClick={props.toggleCustomMessage}
                        />
                    </div>
                    <textarea
                        className='AddToChannels__messageInput'
                        id='invite-members-to-channels'
                        onChange={(e) => props.setCustomMessage(e.target.value)}
                        value={props.customMessage.message}
                    />
                </React.Fragment>
            )}
            <div className='help-text'>
                <FormattedMessage
                    id='invitation_modal.guests.custom-message.description'
                    defaultMessage='Create a custom message to make your invite more personal.'
                />
            </div>
        </div>
    </div>);
}
