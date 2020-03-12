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

export default class AtMentionSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        let username;
        let description;
        let icon;
        if (item.username === 'all') {
            username = 'all';
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
                        <i
                            className='mention__image fa fa-users fa-2x'
                            title={title}
                        />
                    )}
                </FormattedMessage>
            );
        } else if (item.username === 'channel') {
            username = 'channel';
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
                        <i
                            className='mention__image fa fa-users fa-2x'
                            title={title}
                        />
                    )}
                </FormattedMessage>
            );
        } else if (item.username === 'here') {
            username = 'here';
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
                        <i
                            className='mention__image fa fa-users fa-2x'
                            title={title}
                        />
                    )}
                </FormattedMessage>
            );
        } else if (item.type === Constants.MENTION_GROUPS) {
            username = item.display_name;
            description = `- (${item.display_name})`;
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
            username = item.username;

            if ((item.first_name || item.last_name) && item.nickname) {
                description = `- ${Utils.getFullName(item)} (${item.nickname})`;
            } else if (item.nickname) {
                description = `- (${item.nickname})`;
            } else if (item.first_name || item.last_name) {
                description = `- ${Utils.getFullName(item)}`;
            }

            icon = (
                <Avatar
                    size='xs'
                    username={item && item.username}
                    url={Utils.imageURLForUser(item)}
                />
            );
        }

        let youElement = null;
        if (item.isCurrentUser) {
            youElement =
            (<span className='mention__you'>
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
                data-testid={`mentionSuggestion_${username}`}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {icon}
                <span className='mention--align'>
                    {'@' + username}
                </span>
                <BotBadge
                    show={Boolean(item.is_bot)}
                    className='badge-autocomplete'
                />
                <span className='mention__fullname'>
                    {' '}
                    {description}
                </span>
                {youElement}
                <GuestBadge
                    show={Utils.isGuest(item)}
                    className='badge-autocomplete'
                />
            </div>
        );
    }
}
