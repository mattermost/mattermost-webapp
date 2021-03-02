// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Avatar from 'components/widgets/users/avatar';

import Suggestion from '../suggestion.jsx';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

export default class AtMentionSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        let itemname;
        let description;
        let icon;
        let customStatus;
        if (item.username === 'all') {
            itemname = 'all';
            description = (
                <FormattedMessage
                    id='suggestion.mention.all'
                    defaultMessage='Notifies everyone in this channel'
                />
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title) => (
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
                <FormattedMessage
                    id='suggestion.mention.channel'
                    defaultMessage='Notifies everyone in this channel'
                />
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title) => (
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
                <FormattedMessage
                    id='suggestion.mention.here'
                    defaultMessage='Notifies everyone online in this channel'
                />
            );
            icon = (
                <FormattedMessage
                    id='generic_icons.member'
                    defaultMessage='Member Icon'
                >
                    {(title) => (
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
                    {(title) => (
                        <i
                            className='mention__image fa fa-users fa-2x'
                            title={title}
                        />
                    )}
                </FormattedMessage>
            );
        } else {
            itemname = item.username;

            if ((item.first_name || item.last_name) && item.nickname) {
                description = `${Utils.getFullName(item)} (${item.nickname})`;
            } else if (item.nickname) {
                description = `(${item.nickname})`;
            } else if (item.first_name || item.last_name) {
                description = `${Utils.getFullName(item)}`;
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

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
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
                <span>
                    <span className='mention--align'>
                        {'@' + itemname}
                    </span>
                    <BotBadge
                        show={Boolean(item.is_bot)}
                        className='badge-autocomplete'
                    />
                    {customStatus}
                    <span className='light ml-2'>
                        {description}
                        {youElement}
                    </span>
                    <GuestBadge
                        show={Utils.isGuest(item)}
                        className='badge-autocomplete'
                    />
                </span>
            </div>
        );
    }
}
