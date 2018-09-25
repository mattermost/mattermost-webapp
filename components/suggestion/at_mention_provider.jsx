// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import XRegExp from 'xregexp';

import {autocompleteUsersInChannel} from 'actions/user_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import UserStore from 'stores/user_store.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class AtMentionSuggestion extends Suggestion {
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

export default class AtMentionProvider extends Provider {
    constructor(channelId) {
        super();

        this.channelId = channelId;
    }

    handlePretextChanged(suggestionId, pretext) {
        const captured = XRegExp.cache('(?:^|\\W)@([\\pL\\d\\-_.]*)$', 'i').exec(pretext.toLowerCase());
        if (!captured) {
            return false;
        }

        const prefix = captured[1];

        this.startNewRequest(suggestionId, prefix);

        autocompleteUsersInChannel(
            prefix,
            this.channelId,
            (data) => {
                if (this.shouldCancelDispatch(prefix)) {
                    return;
                }

                const members = Object.assign([], data.users);
                for (const id of Object.keys(members)) {
                    members[id] = {...members[id], type: Constants.MENTION_MEMBERS};
                }

                const nonmembers = data.out_of_channel || [];
                for (const id of Object.keys(nonmembers)) {
                    nonmembers[id] = {...nonmembers[id], type: Constants.MENTION_NONMEMBERS};
                }

                let specialMentions = [];
                if (!pretext.startsWith('/msg')) {
                    specialMentions = ['here', 'channel', 'all'].filter((item) => {
                        return item.startsWith(prefix);
                    }).map((name) => {
                        return {username: name, type: Constants.MENTION_SPECIAL};
                    });
                }

                let users = members.concat(specialMentions).concat(nonmembers);
                const me = UserStore.getCurrentUser();
                users = users.filter((user) => {
                    return user.id !== me.id;
                });

                const mentions = users.map((user) => '@' + user.username);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: `@${captured[1]}`,
                    terms: mentions,
                    items: users,
                    component: AtMentionSuggestion,
                });
            }
        );

        return true;
    }
}
