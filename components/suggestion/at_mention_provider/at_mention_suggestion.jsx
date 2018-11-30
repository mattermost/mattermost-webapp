// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

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
                    defaultMessage='CAUTION: This mentions everyone in channel'
                />
            );
            icon = (
                <i
                    className='mention__image fa fa-users fa-2x'
                    title={Utils.localizeMessage('generic_icons.member', 'Member Icon')}
                />
            );
        } else if (user.username === 'channel') {
            username = 'channel';
            description = (
                <FormattedMessage
                    id='suggestion.mention.channel'
                    defaultMessage='Notifies everyone in the channel'
                />
            );
            icon = (
                <i
                    className='mention__image fa fa-users fa-2x'
                    title={Utils.localizeMessage('generic_icons.member', 'Member Icon')}
                />
            );
        } else if (user.username === 'here') {
            username = 'here';
            description = (
                <FormattedMessage
                    id='suggestion.mention.here'
                    defaultMessage='Notifies everyone in the channel and online'
                />
            );
            icon = (
                <i
                    className='mention__image fa fa-users fa-2x'
                    title={Utils.localizeMessage('generic_icons.member', 'Member Icon')}
                />
            );
        } else {
            username = user.username;

            if ((user.first_name || user.last_name) && user.nickname) {
                description = `- ${Utils.getFullName(user)} (${user.nickname})`;
            } else if (user.nickname) {
                description = `- (${user.nickname})`;
            } else if (user.first_name || user.last_name) {
                description = `- ${Utils.getFullName(user)}`;
            }

            icon = (
                <img
                    className='mention__image'
                    src={Utils.imageURLForUser(user)}
                />
            );
        }

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                {...Suggestion.baseProps}
            >
                {icon}
                <span className='mention--align'>
                    {'@' + username}
                </span>
                <span className='mention__fullname'>
                    {' '}
                    {description}
                </span>
            </div>
        );
    }
}
