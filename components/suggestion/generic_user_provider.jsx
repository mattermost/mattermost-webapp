// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import GuestTag from 'components/widgets/tag/guest_tag';
import BotTag from 'components/widgets/tag/bot_tag';

import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import Avatar from 'components/widgets/users/avatar';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class UserSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'suggestion-list__item';
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
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                <Avatar
                    size='xxs'
                    username={username}
                    url={Client4.getUsersRoute() + '/' + item.id + '/image?_=' + (item.last_picture_update || 0)}
                />
                <div className='suggestion-list__ellipsis'>
                    <span className='suggestion-list__main'>
                        {'@' + username}
                    </span>
                    {description}
                </div>
                {item.is_bot && <BotTag/>}
                {isGuest(item.roles) && <GuestTag/>}
            </div>
        );
    }
}

export default class UserProvider extends Provider {
    constructor(searchUsersFunc) {
        super();
        this.autocompleteUsers = searchUsersFunc;
    }
    async handlePretextChanged(pretext, resultsCallback) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        const data = await this.autocompleteUsers(normalizedPretext);

        if (this.shouldCancelDispatch(normalizedPretext)) {
            return false;
        }

        const users = Object.assign([], data.users);

        resultsCallback({
            matchedPretext: normalizedPretext,
            terms: users.map((user) => user.username),
            items: users,
            component: UserSuggestion,
        });

        return true;
    }
}
