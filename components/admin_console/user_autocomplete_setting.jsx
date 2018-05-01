// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Client4} from 'mattermost-redux/client';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {autocompleteUsersInTeam} from 'actions/user_actions.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import Setting from 'components/admin_console/setting.jsx';
import Provider from 'components/suggestion/provider.jsx';
import Suggestion from 'components/suggestion/suggestion.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

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
            >
                <div className='pull-left'>
                    <img
                        className='admin-setting-user__image'
                        src={Client4.getUsersRoute() + '/' + item.id + '/image?_=' + (item.last_picture_update || 0)}
                    />
                </div>
                <div className='pull-left admin-setting-user--align'>
                    <span>
                        {'@' + username}
                    </span>
                    <span className='admin-setting-user__fullname'>
                        {' '}
                        {description}
                    </span>
                </div>
            </div>
        );
    }
}

class UserProvider extends Provider {
    handlePretextChanged(suggestionId, pretext) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(suggestionId, normalizedPretext);

        autocompleteUsersInTeam(
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

export default class UserAutocompleteSetting extends React.Component {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            placeholder: PropTypes.string,
            helpText: PropTypes.node,
            value: PropTypes.string,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
        };
    }

    constructor(props) {
        super(props);

        this.userSuggestionProviders = [new UserProvider()];
    }

    handleChange = (e) => {
        this.props.onChange(this.props.id, e.target.value);
    }

    handleUserSelected = (user) => {
        this.props.onChange(this.props.id, user.username);
    }

    render() {
        return (
            <Setting
                label={this.props.label}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                <div
                    className='admin-setting-user__dropdown'
                >
                    <SuggestionBox
                        id={'admin_user_setting_' + this.props.id}
                        className='form-control'
                        placeholder={this.props.placeholder}
                        value={this.props.value}
                        onChange={this.handleChange}
                        onItemSelected={this.handleUserSelected}
                        listComponent={SuggestionList}
                        listStyle='bottom'
                        providers={this.userSuggestionProviders}
                        disabled={this.props.disabled}
                        requiredCharacters={0}
                        openOnFocus={true}
                    />
                </div>
            </Setting>
        );
    }
}
