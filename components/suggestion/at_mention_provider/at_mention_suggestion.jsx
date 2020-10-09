// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {
    getUser,
    getCurrentUserId,
    getStatusForUserId,
} from 'mattermost-redux/selectors/entities/users';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import Avatar from 'components/widgets/users/avatar';
import StatusIcon from 'components/status_icon';

import store from 'stores/redux_store.jsx';
import Suggestion from '../suggestion.jsx';

export default class AtMentionSuggestion extends Suggestion {
    render() {
        const getState = store.getState;
        const isSelection = this.props.isSelection;
        const item = this.props.item;
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const status = getStatusForUserId(state, currentUserId);
        const user = getUser(state, currentUserId);
        const username = user.username;
        const firstName = user.first_name;
        const lastName = user.last_name;
        const nameComplete = `${firstName} ${lastName}`;

        let itemname;
        let description;
        let icon;
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

        let displayStatusUser = (
            <span className='mention--align'>
                {nameComplete}
                <StatusIcon
                    className={`${status}--icon`}
                    status={status}
                    button={false}
                />
                {username}
            </span>
        );

        if (!firstName) {
            displayStatusUser = (
                <span className='mention--align'>
                    {username}
                    <StatusIcon
                        className={`${status}--icon`}
                        status={status}
                        button={false}
                    />
                </span>
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
                <span>
                    {displayStatusUser}
                    <BotBadge
                        show={Boolean(item.is_bot)}
                        className='badge-autocomplete'
                    />
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
