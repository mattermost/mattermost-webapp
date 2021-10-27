// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import CloseCircleIcon from 'components/widgets/icons/close_circle_icon';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import ChannelsInput from 'components/widgets/inputs/channels_input';
import {Channel} from 'mattermost-redux/types/channels';

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

type Props = {
    customMessage: CustomMessageProps;
    toggleCustomMessage: () => void;
    setCustomMessage: (message: string) => void;
    inviteChannels: InviteChannels;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (search: string) => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    currentChannelName: string;
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

    return (<div>
        <FormattedMessage
            id='invite_modal.add_channels_title_a'
            defaultMessage='Add to channels'
        />
        <FormattedMessage
            id='invite_modal.add_channels_title_b'
            defaultMessage='(required)'
        />
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

        <FormattedMessage
            id='invitation_modal.guests.custom-message.link'
            defaultMessage='Set a custom message'
        />
        <FormattedMessage
            id='invitation_modal.guests.custom-message.description'
            defaultMessage='Create a custom message to make your invite more personal.'
        />
        <div
            className='custom-message'
            data-testid='customMessage'
        >
            {!props.customMessage.open && (
                <a
                    onClick={props.toggleCustomMessage}
                    href='#'
                >
                    <FormattedMessage
                        id='invitation_modal.guests.custom-message.link'
                        defaultMessage='Set a custom message'
                    />
                </a>
            )}
            {props.customMessage.open && (
                <React.Fragment>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.guests.custom-message.title'
                            defaultMessage='Custom message'
                        />
                        <CloseCircleIcon
                            onClick={props.toggleCustomMessage}
                        />
                    </div>
                    <textarea
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
