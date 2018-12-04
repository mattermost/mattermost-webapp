// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {autocompleteUsersInTeam} from 'actions/user_actions.jsx';
import * as Utils from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class SearchUserSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected';
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
                <i
                    className='fa fa fa-plus-square'
                    title={Utils.localizeMessage('generic_icons.select', 'Select Icon')}
                />
                <img
                    className='profile-img rounded'
                    src={Utils.imageURLForUser(item)}
                />
                <div className='mention--align'>
                    <span>
                        {username}
                    </span>
                    <span className='mention__fullname'>
                        {' '}
                        {description}
                    </span>
                </div>
            </div>
        );
    }
}

export default class SearchUserProvider extends Provider {
    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\bfrom:\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const usernamePrefix = captured[1];

            this.startNewRequest(usernamePrefix);

            autocompleteUsersInTeam(
                usernamePrefix,
                (data) => {
                    if (this.shouldCancelDispatch(usernamePrefix)) {
                        return;
                    }

                    const users = Object.assign([], data.users);
                    const mentions = users.map((user) => user.username);

                    resultsCallback({
                        matchedPretext: usernamePrefix,
                        terms: mentions,
                        items: users,
                        component: SearchUserSuggestion,
                    });
                }
            );
        }

        return Boolean(captured);
    }

    allowDividers() {
        return false;
    }
}
