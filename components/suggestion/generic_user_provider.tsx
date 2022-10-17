// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';

import Provider from './provider';
import Suggestion from './suggestion.jsx';
import {UserAutocomplete, UserProfile} from './command_provider/app_command_parser/app_command_parser_dependencies.js';

type ProviderResults = {
    matchedPretext: string;
    terms: string[];
    items: Array<Record<string, any>>;
    component?: React.ReactNode;
}

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
                    <span>
                        {' '}
                        {description}
                    </span>
                </div>
                <BotBadge show={Boolean(item.is_bot)}/>
                <GuestBadge show={isGuest(item.roles)}/>
            </div>
        );
    }
}

export default class UserProvider extends Provider {
    autocompleteUsers: (text: string) => Promise<UserAutocomplete>;
    constructor(searchUsersFunc: (username: string) => Promise<UserAutocomplete>) {
        super();
        this.autocompleteUsers = searchUsersFunc;
    }
    async handlePretextChanged(pretext: string, resultsCallback: (res: ProviderResults) => void) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        const data = await this.autocompleteUsers(normalizedPretext);

        if (this.shouldCancelDispatch(normalizedPretext)) {
            return false;
        }

        const users = Object.assign([], data.users);

        resultsCallback({
            matchedPretext: normalizedPretext,
            terms: users.map((user: UserProfile) => user.username),
            items: users,
            component: UserSuggestion,
        });

        return true;
    }
}
