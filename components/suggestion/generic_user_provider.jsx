// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Client4} from 'mattermost-redux/client';

import {autocompleteUsers} from 'actions/user_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class UserSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'suggestion-list__item mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const username = item.username;
        let description = '';

        if ((item.first_name || item.last_name) && item.nickname) {
            description = `- ${Utils.getFullName(item)} (${item.nickname})`;
        } else if (item.nickname) {
            description = `- (${item.nickname})`;
        } else if (item.first_name || item.last_name) {
            description = `- ${Utils.getFullName(item)}`;
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                {...Suggestion.baseProps}
            >
                <img
                    className='admin-setting-user__image'
                    src={Client4.getUsersRoute() + '/' + item.id + '/image?_=' + (item.last_picture_update || 0)}
                />
                <span className='admin-setting-user--align'>
                    {'@' + username}
                </span>
                <span className='admin-setting-user__fullname'>
                    {' '}
                    {description}
                </span>
            </div>
        );
    }
}

export default class UserProvider extends Provider {
    handlePretextChanged(suggestionId, pretext) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(suggestionId, normalizedPretext);

        autocompleteUsers(
            normalizedPretext,
            (data) => {
                if (this.shouldCancelDispatch(normalizedPretext)) {
                    return;
                }

                const users = Object.assign([], data.users);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: normalizedPretext,
                    terms: users.map((user) => user.username),
                    items: users,
                    component: UserSuggestion,
                });
            }
        );

        return true;
    }
}
