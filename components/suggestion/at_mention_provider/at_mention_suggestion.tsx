// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import SharedUserIndicator from 'components/shared_user_indicator';
import Avatar from 'components/widgets/users/avatar';

import Suggestion, {SuggestionProps} from '../suggestion';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

import {Item} from './at_mention_provider';

interface Props extends Omit<SuggestionProps, 'item'>{
    item: Item;
}

export default class AtMentionSuggestion extends Suggestion<Props> {
    render(): JSX.Element {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        let itemname;
        let description;
        let icon;
        let customStatus;
        if (item.username === 'all') {
            itemname = 'all';
            description = (
                <span className='ml-2'>
                    <FormattedMessage
                        id='suggestion.mention.all'
                        defaultMessage='Notifies everyone in this channel'
                    />
                </span>
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title: string) => (
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else if (item.username === 'channel') {
            itemname = 'channel';
            description = (
                <span className='ml-2'>
                    <FormattedMessage
                        id='suggestion.mention.channel'
                        defaultMessage='Notifies everyone in this channel'
                    />
                </span>
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title: string) => (
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else if (item.username === 'here') {
            itemname = 'here';
            description = (
                <span className='ml-2'>
                    <FormattedMessage
                        id='suggestion.mention.here'
                        defaultMessage='Notifies everyone online in this channel'
                    />
                </span>
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title: string) => (
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else if (item.type === Constants.MENTION_GROUPS) {
            itemname = item.name;
            description = `- ${item.display_name}`;
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Group Icon'
                >
                    {(title: string) => (
                        <i
                            className='suggestion-list__icon fa fa-users fa-2x'
                            title={title}
                        />
                    )}
                </FormattedMessage>
            );
        } else {
            itemname = item.username;

            if (item.isCurrentUser) {
                if (item.first_name || item.last_name) {
                    description = (
                        <span className='ml-2'>
                            {Utils.getFullName(item)}
                        </span>
                    );
                }
            } else if (item.first_name || item.last_name || item.nickname) {
                description = (
                    <span className='ml-2'>
                        {`${Utils.getFullName(item)} ${
                            item.nickname ? `(${item.nickname})` : ''
                        }`.trim()}
                    </span>
                );
            }

            icon = (
                <Avatar
                    size='sm'
                    username={item && item.username}
                    url={Utils.imageURLForUser(item.id, item.last_picture_update)}
                />
            );

            customStatus = (
                <CustomStatusEmoji
                    showTooltip={true}
                    userID={item.id}
                    emojiSize={15}
                    emojiStyle={{
                        margin: '0 4px 4px',
                    }}
                />
            );
        }

        let youElement = null;
        if (item.isCurrentUser) {
            youElement =
            (<span className='ml-1'>
                <FormattedMessage
                    id='suggestion.user.isCurrent'
                    defaultMessage='(you)'
                />
            </span>);
        }

        let className = 'suggestion-list__item';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        let sharedIcon;
        if (item.remote_id) {
            sharedIcon = (
                <SharedUserIndicator
                    className='shared-user-icon'
                    withTooltip={true}
                />
            );
        }

        return (
            <div
                className={className}
                data-testid={`mentionSuggestion_${itemname}`}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {icon}
                <span className='suggestion-list__ellipsis'>
                    <span className='suggestion-list__main'>
                        {'@' + itemname}
                    </span>
                    <BotBadge
                        show={Boolean(item.is_bot)}
                        className='badge-autocomplete'
                    />
                    {customStatus}
                    {description}
                    {youElement}
                    {sharedIcon}
                    <GuestBadge
                        show={Utils.isGuest(item)}
                        className='badge-autocomplete'
                    />
                </span>
            </div>
        );
    }
}
