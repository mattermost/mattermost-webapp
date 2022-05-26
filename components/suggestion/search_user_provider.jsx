// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Utils from 'utils/utils';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';
import SharedUserIndicator from 'components/shared_user_indicator';
import store from 'stores/redux_store.jsx';

import {getAllDirectChannels} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

const MAX_USER_SUGGESTIONS = 25;
const MAX_LOCAL_USER_SUGGESTIONS = 10;

class SearchUserSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'suggestion-list__item';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const username = item.username;
        let description = '';

        if ((item.first_name || item.last_name) && item.nickname) {
            description = `${Utils.getFullName(item)} (${item.nickname})`;
        } else if (item.nickname) {
            description = `(${item.nickname})`;
        } else if (item.first_name || item.last_name) {
            description = `${Utils.getFullName(item)}`;
        }

        let sharedIcon;
        if (item.remote_id) {
            sharedIcon = (
                <SharedUserIndicator
                    className='mention__shared-user-icon'
                    withTooltip={true}
                />
            );
        }

        return (
            <div
                className={className}
                ref={(node) => {
                    this.node = node;
                }}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                <Avatar
                    size='sm'
                    username={username}
                    url={Utils.imageURLForUser(item.id, item.last_picture_update)}
                />
                <div className='suggestion-list__ellipsis'>
                    <span className='suggestion-list__main'>
                        {'@'}{username}
                    </span>
                    <BotBadge
                        show={Boolean(item.is_bot)}
                        className='badge-autocomplete'
                    />
                    <span className='ml-2'>
                        {description}
                    </span>
                </div>
                {sharedIcon}
            </div>
        );
    }
}

export default class SearchUserProvider extends Provider {
    constructor(userSearchFunc) {
        super();
        this.autocompleteUsersInTeam = userSearchFunc;
    }


    handlePretextChanged(pretext, resultsCallback) {
        const captured = (/\bfrom:\s*(\S*)$/i).exec(pretext.toLowerCase());

        this.doAutocomplete(captured, resultsCallback);

        return Boolean(captured);
    }

    directMessageUsers(usernamePrefix) {
        const state = store.getState();

        const directChannels = getAllDirectChannels(state);
        const sortByLastPost = (a, b) => {
            return a.last_post_at > b.last_post_at ? -1 : 1;
        };
        const directMessageChannels = directChannels.filter((channel) => channel.teammate_id != null).sort(sortByLastPost);
        
        const re = new RegExp(usernamePrefix);
        const directMessageUsers = directMessageChannels.map((dm) => getUser(state, dm.teammate_id))
            .filter((user) => re.test(user.first_name) || re.test(user.last_name) || re.test(user.nickname) || re.test(user.username)).slice(0, MAX_LOCAL_USER_SUGGESTIONS); 

        return directMessageUsers;
    }

    async doAutocomplete(captured, resultsCallback) {
        if (!captured) {
            return;
        }

        const usernamePrefix = captured[1];


        this.startNewRequest(usernamePrefix);
        
        const data = await this.autocompleteUsersInTeam(usernamePrefix);

        if (this.shouldCancelDispatch(usernamePrefix)) {
            return;
        }

        const directMessageUsers = this.directMessageUsers(usernamePrefix);
        const autocompleteUsers = Object.assign([], data.users);
        const users = directMessageUsers.concat(autocompleteUsers).slice(0, MAX_USER_SUGGESTIONS);
        const mentions = users.map((user) => user.username);

        resultsCallback({
            matchedPretext: usernamePrefix,
            terms: mentions,
            items: users,
            component: SearchUserSuggestion,
        });
    }

    allowDividers() {
        return true;
    }
}
