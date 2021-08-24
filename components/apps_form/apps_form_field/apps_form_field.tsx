// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppField, AppSelectOption} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {AppFieldTypes} from 'mattermost-redux/constants/apps';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

import TextSetting, {InputTypes} from 'components/widgets/settings/text_setting';
import AutocompleteSelector from 'components/autocomplete_selector';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list.jsx';
import BoolSetting from 'components/widgets/settings/bool_setting';
import Provider from 'components/suggestion/provider';

import Markdown from 'components/markdown';

import AppsFormSelectField from './apps_form_select_field';

const TEXT_DEFAULT_MAX_LENGTH = 150;
const TEXTAREA_DEFAULT_MAX_LENGTH = 3000;

export interface Props {
    field: AppField;
    name: string;
    errorText?: React.ReactNode;
    teammateNameDisplay?: string;

    value: AppSelectOption | string | boolean | number | null;
    onChange: (name: string, value: any) => void;
    autoFocus?: boolean;
    listComponent?: React.ComponentProps<typeof AutocompleteSelector>['listComponent'];
    performLookup: (name: string, userInput: string) => Promise<AppSelectOption[]>;
    actions: {
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;
        autocompleteUsers: (search: string) => Promise<UserProfile[]>;
    };
}

export default class AppsFormField extends React.PureComponent<Props> {
    private providers: Provider[] = [];

    static defaultProps = {
        listComponent: ModalSuggestionList,
    };

    constructor(props: Props) {
        super(props);
        this.setProviders();
    }

    handleSelected = (selected: AppSelectOption | UserProfile | Channel) => {
        const {name, field, onChange} = this.props;

        if (field.type === AppFieldTypes.USER) {
            const user = selected as UserProfile;
            let selectedLabel = user.username;
            if (this.props.teammateNameDisplay) {
                selectedLabel = displayUsername(user, this.props.teammateNameDisplay);
            }
            const option = {label: selectedLabel, value: user.id};
            onChange(name, option);
        } else if (field.type === AppFieldTypes.CHANNEL) {
            const channel = selected as Channel;
            const option = {label: channel.display_name, value: channel.id};
            onChange(name, option);
        } else {
            const option = selected as AppSelectOption;
            onChange(name, option);
        }
    }

    setProviders = () => {
        const {actions, field} = this.props;

        let providers: Provider[] = [];
        if (field.type === AppFieldTypes.USER) {
            providers = [new GenericUserProvider(actions.autocompleteUsers)];
        } else if (field.type === AppFieldTypes.CHANNEL) {
            providers = [new GenericChannelProvider(actions.autocompleteChannels)];
        }

        this.providers = providers;
    }

    render() {
        const {
            field,
            name,
            value,
            onChange,
            errorText,
            listComponent,
        } = this.props;

        const placeholder = field.hint || '';

        let errorTextContent;
        if (!field.hide_required_star) {
            errorTextContent = (
                <span className='error-text'>{' *'}</span>
            );
        }

        const displayName = (field.modal_label || field.label) as string;
        let displayNameContent: React.ReactNode = (field.modal_label || field.label) as string;

        const showStar = field.is_required && !field.hide_required_star;
        if (showStar || displayName) {
            displayNameContent = (
                <React.Fragment>
                    {displayName}
                    {errorTextContent}
                </React.Fragment>
            );
        }

        const helpText = field.description;
        let helpTextContent: React.ReactNode = <Markdown message={helpText}/>;
        if (errorText) {
            helpTextContent = (
                <React.Fragment>
                    <Markdown message={helpText}/>
                    <div className='error-text mt-3'>
                        {errorText}
                    </div>
                </React.Fragment>
            );
        }

        switch (field.type) {
        case AppFieldTypes.TEXT: {
            const subtype = field.subtype || 'text';

            let maxLength = field.max_length;
            if (!maxLength) {
                if (subtype === 'textarea') {
                    maxLength = TEXTAREA_DEFAULT_MAX_LENGTH;
                } else {
                    maxLength = TEXT_DEFAULT_MAX_LENGTH;
                }
            }

            let textType: InputTypes = 'input';
            if (subtype && TextSetting.validTypes.includes(subtype)) {
                textType = subtype as InputTypes;
            }

            const textValue = value as string;
            return (
                <TextSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
                    disabled={field.readonly}
                    type={textType}
                    label={displayNameContent}
                    maxLength={maxLength}
                    value={textValue || ''}
                    placeholder={placeholder}
                    helpText={helpTextContent}
                    onChange={onChange}
                    resizable={false}
                />
            );
        }
        case AppFieldTypes.CHANNEL:
        case AppFieldTypes.USER: {
            let selectedValue: string | undefined;
            if (this.props.value) {
                selectedValue = (this.props.value as AppSelectOption).label;
            }
            return (
                <AutocompleteSelector
                    id={name}
                    disabled={field.readonly}
                    providers={this.providers}
                    onSelected={this.handleSelected}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    value={selectedValue}
                    listComponent={listComponent}
                />
            );
        }
        case AppFieldTypes.STATIC_SELECT:
        case AppFieldTypes.DYNAMIC_SELECT: {
            return (
                <AppsFormSelectField
                    {...this.props}
                    field={field}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    onChange={this.handleSelected}
                    value={this.props.value as AppSelectOption | null}
                />
            );
        }
        case AppFieldTypes.BOOL: {
            const boolValue = value as boolean;
            return (
                <BoolSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
                    disabled={field.readonly}
                    label={displayNameContent}
                    value={boolValue || false}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    onChange={onChange}
                />
            );
        }
        case AppFieldTypes.MARKDOWN: {
            return (
                <Markdown
                    message={field.description}
                />
            );
        }
        }

        return null;
    }
}
