// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Utils from 'utils/utils.jsx';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';
import SharedUserIndicator from 'components/shared_user_indicator';

import {UserProfile} from 'mattermost-redux/types/users';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import Provider, {ResultCallbackParams} from './provider';
import Suggestion, {SuggestionProps} from './suggestion';

type Props = Omit<SuggestionProps, 'item'> & {item: UserProfile};

class SearchUserSuggestion extends Suggestion<Props> {
    node: HTMLDivElement | null = null;

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

type UserSearchFunc = (username: string) => DispatchFunc;
type CallbackParams = Omit<ResultCallbackParams, 'items'> & {items: UserProfile[]};

export default class SearchUserProvider extends Provider {
    autocompleteUsersInTeam: UserSearchFunc;

    constructor(userSearchFunc: UserSearchFunc) {
        super();
        this.autocompleteUsersInTeam = userSearchFunc;
    }

    handlePretextChanged(pretext: string, resultsCallback: (params: CallbackParams) => void): boolean {
        const captured = (/\bfrom:\s*(\S*)$/i).exec(pretext.toLowerCase());

        this.doAutocomplete(captured, resultsCallback);

        return Boolean(captured);
    }

    async doAutocomplete(captured: RegExpExecArray | null, resultsCallback: (params: CallbackParams) => void): Promise<void> {
        if (!captured) {
            return;
        }

        const usernamePrefix = captured[1];

        this.startNewRequest(usernamePrefix);

        const data = await this.autocompleteUsersInTeam(usernamePrefix);

        if (this.shouldCancelDispatch(usernamePrefix)) {
            return;
        }

        const users: UserProfile[] = Object.assign([], (data as any).users);
        const mentions = users.map((user) => user.username);

        resultsCallback({
            matchedPretext: usernamePrefix,
            terms: mentions,
            items: users,
            component: SearchUserSuggestion,
        });
    }

    allowDividers(): boolean {
        return true;
    }
}
