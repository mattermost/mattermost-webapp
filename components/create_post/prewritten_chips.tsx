// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import {PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';
import Chip from './temp_chip'

type Props = {
    prewrittenMessages?: PrewrittenMessagesTreatments;
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    intl: IntlShape;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

function getChips(channel: Channel, currentUserId: string): {displayId: string, display: string, messageId: string, message: string}[] {
    const customChip = {
        messageId: '',
        message: '',
        displayId: 'create_post.prewritten.custom',
        display: 'Write a custom message...',
    };
    if (channel.type === 'O' || channel.type === 'P' || channel.type === 'G') {
        return [
            {
                messageId: 'create_post.prewritten.tip.team_hi_message',
                message: ':hand: Hi team!',
                displayId: 'create_post.prewritten.tip.team_hi',
                display: 'Hi team!',
            },
            {
                messageId: 'create_post.prewritten.tip.team_excited_message',
                message: ':raised_hands: Excited to be here!',
                displayId: 'create_post.prewritten.tip.team_excited',
                display: 'Excited to be here!',
            },
            {
                messageId: 'create_post.prewritten.tip.team_hey_message',
                message: ':smile: Hey everyone!',
                displayId: 'create_post.prewritten.tip.team_hey',
                display: 'Hey everyone!',
            },
            customChip,
        ]
    }

    if (channel.teammate_id === currentUserId) {
        return [
            {
                messageId: 'create_post.prewritten.tip.self_note',
                message: 'Note to self...',
                displayId: 'create_post.prewritten.tip.self_note',
                display: 'Note to self...',
            },
            {
                messageId: 'create_post.prewritten.tip.self_should',
                message: 'Tomorrow I should...',
                displayId: 'create_post.prewritten.tip.self_should',
                display: 'Tomorrow I should...',
            },
            customChip,
        ];
    }

    return [
        {
            messageId: 'create_post.prewritten.tip.dm_hey_message',
            message: ':hand: Hey @{username}',
            displayId: 'create_post.prewritten.tip.dm_hey',
            display: 'Hey @{username}',
        },
        {
            messageId: 'create_post.prewritten.tip.dm_hello_message',
            message: ':raised_hands: Oh hello',
            displayId: 'create_post.prewritten.tip.dm_hello',
            display: 'Oh hello',
        },
        customChip,
    ];
}


class PrewrittenChips extends React.PureComponent<Props> {
    render() {
        const chips = getChips(this.props.currentChannel, this.props.currentUserId);
        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                }}>
                {chips.map(({messageId, message, displayId, display}) => {
                    
                    const messageToPrefill = messageId ? this.props.intl.formatMessage(
                        {id: messageId, defaultMessage: message},
                        {username: this.props.currentChannelTeammateUsername}
                    )
                    : message;
                    return (
                        <Chip
                            key={displayId}
                            id={displayId}
                            defaultMessage={display}
                            values={{username: this.props.currentChannelTeammateUsername}}
                            onClick={() => {this.props.prefillMessage(messageToPrefill, true)}} 
                        />
                    );
                })}
            </div>
        );
    }
}

export default injectIntl(PrewrittenChips);
