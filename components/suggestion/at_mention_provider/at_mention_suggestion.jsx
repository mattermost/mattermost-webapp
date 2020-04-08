// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Avatar from 'components/widgets/users/avatar';

import Suggestion from '../suggestion.jsx';

export default class AtMentionSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const user = this.props.item;

        let username;
        let description;
        let icon;
        if (user.username === 'all') {
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
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else if (user.username === 'channel') {
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
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else if (user.username === 'here') {
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
                        <span className='suggestion-list__icon suggestion-list__icon--large'>
                            <i
                                className='icon icon-account-multiple-outline'
                                title={title}
                            />
                        </span>
                    )}
                </FormattedMessage>
            );
        } else {
            username = user.username;

            if ((user.first_name || user.last_name) && user.nickname) {
                description = `${Utils.getFullName(user)} (${user.nickname})`;
            } else if (user.nickname) {
                description = `(${user.nickname})`;
            } else if (user.first_name || user.last_name) {
                description = `${Utils.getFullName(user)}`;
            }

            icon = (
                <Avatar
                    size='sm'
                    username={user && user.username}
                    url={Utils.imageURLForUser(user.id, user.last_picture_update)}
                />
            );
        }

        let youElement = null;
        if (user.isCurrentUser) {
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
                data-testid={`mentionSuggestion_${username}`}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {icon}
                <span>
                    <span className='mention--align'>
                        {'@' + username}
                    </span>
                    <BotBadge
                        show={Boolean(user.is_bot)}
                        className='badge-autocomplete'
                    />
                    <span className='light ml-2'>
                        {description}
                        {youElement}
                    </span>
                    <GuestBadge
                        show={Utils.isGuest(user)}
                        className='badge-autocomplete'
                    />
                </span>
            </div>
        );
    }
}
