// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import styled from 'styled-components';

import {trackEvent} from 'actions/telemetry_actions';

import {PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';

import {t} from 'utils/i18n.jsx';

import Chip from './chip';

type Props = {
    prewrittenMessages?: PrewrittenMessagesTreatments;
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    intl: IntlShape;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

const UsernameMention = styled.span`
    margin-left: 5px;
    color: var(--link-color);
`;

const ChipContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

type ChipData = {
    display: string;
    displayId: string;
    leadingIcon: string;
    message: string;
    messageId: string;
    event: string;
};

function getChips(channel: Channel, currentUserId: string): ChipData[] {
    const customChip = {
        event: 'prefilled_message_selected_custom',
        messageId: '',
        message: '',
        displayId: t('create_post.prewritten.custom'),
        display: 'Write a custom message...',
        leadingIcon: '',
    };
    if (channel.type === 'O' || channel.type === 'P' || channel.type === 'G') {
        return [
            {
                event: 'prefilled_message_selected_team_hi',
                messageId: t('create_post.prewritten.tip.team_hi_message'),
                message: ':wave: Hi team!',
                displayId: t('create_post.prewritten.tip.team_hi'),
                display: 'Hi team!',
                leadingIcon: 'wave',
            },
            {
                event: 'prefilled_message_selected_team_excited',
                messageId: t('create_post.prewritten.tip.team_excited_message'),
                message: ':raised_hands: Excited to be here!',
                displayId: t('create_post.prewritten.tip.team_excited'),
                display: 'Excited to be here!',
                leadingIcon: 'raised_hands',
            },
            {
                event: 'prefilled_message_selected_team_hey',
                messageId: t('create_post.prewritten.tip.team_hey_message'),
                message: ':smile: Hey everyone!',
                displayId: t('create_post.prewritten.tip.team_hey'),
                display: 'Hey everyone!',
                leadingIcon: 'smile',
            },
            customChip,
        ];
    }

    if (channel.teammate_id === currentUserId) {
        return [
            {
                event: 'prefilled_message_selected_self_note',
                messageId: t('create_post.prewritten.tip.self_note'),
                message: 'Note to self...',
                displayId: t('create_post.prewritten.tip.self_note'),
                display: 'Note to self...',
                leadingIcon: '',
            },
            {
                event: 'prefilled_message_selected_self_should',
                messageId: t('create_post.prewritten.tip.self_should'),
                message: 'Tomorrow I should...',
                displayId: t('create_post.prewritten.tip.self_should'),
                display: 'Tomorrow I should...',
                leadingIcon: '',
            },
            customChip,
        ];
    }

    return [
        {
            event: 'prefilled_message_selected_dm_hey',
            messageId: t('create_post.prewritten.tip.dm_hey_message'),
            message: ':wave: Hey @{username}',
            displayId: t('create_post.prewritten.tip.dm_hey'),
            display: 'Hey',
            leadingIcon: 'wave',
        },
        {
            event: 'prefilled_message_selected_dm_hello',
            messageId: t('create_post.prewritten.tip.dm_hello_message'),
            message: ':v: Oh hello',
            displayId: t('create_post.prewritten.tip.dm_hello'),
            display: 'Oh hello',
            leadingIcon: 'v',
        },
        customChip,
    ];
}

class PrewrittenChips extends React.PureComponent<Props> {
    render() {
        const chips = getChips(this.props.currentChannel, this.props.currentUserId);
        return (
            <ChipContainer>
                {chips.map(({event, messageId, message, displayId, display, leadingIcon}) => {
                    const messageToPrefill = messageId ? this.props.intl.formatMessage(
                        {id: messageId, defaultMessage: message},
                        {username: this.props.currentChannelTeammateUsername},
                    ) :
                        message;
                    let additionalMarkup;
                    if (displayId === 'create_post.prewritten.tip.dm_hey') {
                        additionalMarkup = (<UsernameMention>
                            {'@'}{this.props.currentChannelTeammateUsername}
                        </UsernameMention>);
                    }
                    return (
                        <Chip
                            key={displayId}
                            id={displayId}
                            defaultMessage={display}
                            additionalMarkup={additionalMarkup}
                            values={{username: this.props.currentChannelTeammateUsername}}
                            onClick={() => {
                                if (event) {
                                    trackEvent('ui', event);
                                }
                                this.props.prefillMessage(messageToPrefill, true);
                            }}
                            otherOption={!messageId}
                            leadingIcon={leadingIcon}
                        />
                    );
                })}
            </ChipContainer>
        );
    }
}

export default injectIntl(PrewrittenChips);
