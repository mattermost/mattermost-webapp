// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactSelect from 'react-select';
import {Props as AsyncSelectProps} from 'react-select/async';

import {AppField, AppSelectOption} from '@mattermost/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {Channel} from '@mattermost/types/channels';
import {UserAutocomplete} from '@mattermost/types/autocomplete';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {Client4} from 'mattermost-redux/client';

import {SelectUserOption} from './select_user_option';
import {SelectChannelOption} from './select_channel_option';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<AppSelectOption>>; // eslint-disable-line global-require

export type Props = {
    field: AppField;
    label: React.ReactNode;
    helpText: React.ReactNode;
    value: AppSelectOption | null;
    onChange: (value: AppSelectOption) => void;
    performLookup: (name: string, userInput: string) => Promise<AppSelectOption[]>;
    teammateNameDisplay?: string;
    actions: {
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;
        autocompleteUsers: (search: string) => Promise<UserAutocomplete>;
    };
};

export type State = {
    refreshNonce: string;
    field: AppField;
}

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
    }),
};

const commonComponents = {
    MultiValueLabel: (props: {data: {label: string}}) => (
        <div className='react-select__padded-component'>
            {props.data.label}
        </div>
    ),
};

const commonProps = {
    isClearable: true,
    openMenuOnFocus: false,
    classNamePrefix: 'react-select-auto react-select',
    menuPortalTarget: document.body,
    styles: reactStyles,
};

export default class AppsFormSelectField extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            field: props.field,
            refreshNonce: Math.random().toString(),
        };
    }
    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.field !== prevState.field) {
            return {
                field: nextProps.field,
                refreshNonce: Math.random().toString(),
            };
        }

        return null;
    }

    onChange = (selectedOption: AppSelectOption) => {
        this.props.onChange(selectedOption);
    }

    loadDynamicOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        return this.props.performLookup(this.props.field.name, userInput);
    }

    loadDynamicUserOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        const usersSearchResults: UserAutocomplete = await this.props.actions.autocompleteUsers(userInput.toLowerCase());
        return usersSearchResults.users.map((user) => ({...user, label: this.props.teammateNameDisplay ? displayUsername(user, this.props.teammateNameDisplay) : user.username, value: user.id, icon_data: Client4.getUsersRoute() + '/' + user.id + '/image?_=' + (user.last_picture_update || 0)}));
    }

    loadDynamicChannelOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        let channelsSearchResults: Channel[] = [];

        await this.props.actions.autocompleteChannels(userInput.toLowerCase(), (data) => {
            channelsSearchResults = data;
        }, () => {});

        return channelsSearchResults.map((channel) => ({...channel, label: channel.name, value: channel.id}));
    }

    renderDynamicSelect() {
        const {field} = this.props;
        const placeholder = field.hint || '';
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`MultiInput_${field.name}`}
                    loadOptions={this.loadDynamicOptions}
                    defaultOptions={true}
                    isMulti={field.multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={field.readonly}
                    components={commonComponents}
                    {...commonProps}
                />
            </div>
        );
    }

    renderUserSelect() {
        const {field} = this.props;
        const placeholder = field.hint || '';
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`MultiInput_${field.name}`}
                    loadOptions={this.loadDynamicUserOptions}
                    defaultOptions={true}
                    isMulti={field.multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={field.readonly}
                    components={{...commonComponents, Option: SelectUserOption}}
                    {...commonProps}
                />
            </div>
        );
    }

    renderChannelSelect() {
        const {field} = this.props;
        const placeholder = field.hint || '';
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`MultiInput_${field.name}`}
                    loadOptions={this.loadDynamicChannelOptions}
                    defaultOptions={true}
                    isMulti={field.multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={field.readonly}
                    components={{...commonComponents, Option: SelectChannelOption}}
                    {...commonProps}
                />
            </div>
        );
    }

    renderStaticSelect() {
        const {field} = this.props;

        const placeholder = field.hint || '';

        const options = field.options;
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <ReactSelect
                    id={`MultiInput_${field.name}`}
                    options={options}
                    isMulti={field.multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={field.readonly}
                    components={commonComponents}
                    {...commonProps}
                />
            </div>
        );
    }

    render() {
        const {field, label, helpText} = this.props;

        let selectComponent;
        if (field.type === 'dynamic_select') {
            selectComponent = this.renderDynamicSelect();
        } else if (field.type === 'static_select') {
            selectComponent = this.renderStaticSelect();
        } else if (field.type === AppFieldTypes.USER) {
            selectComponent = this.renderUserSelect();
        } else if (field.type === AppFieldTypes.CHANNEL) {
            selectComponent = this.renderChannelSelect();
        } else {
            return null;
        }

        return (
            <div className='form-group'>
                {label && (
                    <label>
                        {label}
                    </label>
                )}
                <React.Fragment key={this.state.refreshNonce}>
                    {selectComponent}
                    <div className='help-text'>
                        {helpText}
                    </div>
                </React.Fragment>
            </div>
        );
    }
}
