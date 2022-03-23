// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import Setting from 'components/admin_console/setting';
import SuggestionBox from 'components/suggestion/suggestion_box';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

type Props = {
    id: string;
    label: string;
    placeholder: string;
    helpText: string;
    value: string;
    onChange: (id: string, value: string) => void;
    disabled: boolean;
    actions: {
        autocompleteUsers: (username: string) => (doDispatch: DispatchFunc) => Promise<UserProfile[]>;
    };
}

const UserAutocompleteSetting = (props: Props) => {
    const userSuggestionProviders = [new GenericUserProvider(props.actions.autocompleteUsers)];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(props.id, e.target.value);
    };

    const handleUserSelected = (user: UserProfile) => {
        props.onChange(props.id, user.username);
    };

    return (
        <Setting
            label={props.label}
            helpText={props.helpText}
            inputId={props.id}
        >
            <div
                className='admin-setting-user__dropdown'
            >
                <SuggestionBox
                    id={'admin_user_setting_' + props.id}
                    className='form-control'
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={handleChange}
                    onItemSelected={handleUserSelected}
                    listComponent={SuggestionList}
                    listPosition='bottom'
                    providers={userSuggestionProviders}
                    disabled={props.disabled}
                    requiredCharacters={0}
                    openOnFocus={true}
                />
            </div>
        </Setting>
    );
};

export default UserAutocompleteSetting;
