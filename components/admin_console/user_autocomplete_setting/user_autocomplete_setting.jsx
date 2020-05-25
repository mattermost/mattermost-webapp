// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import Setting from 'components/admin_console/setting';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

export default class UserAutocompleteSetting extends React.PureComponent {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            placeholder: PropTypes.string,
            helpText: PropTypes.node,
            value: PropTypes.string,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
            actions: PropTypes.shape({
                autocompleteUsers: PropTypes.func.isRequired,
            }),
        };
    }

    constructor(props) {
        super(props);

        this.userSuggestionProviders = [new GenericUserProvider(props.actions.autocompleteUsers)];
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
