// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppField, AppSelectOption} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

import TextSetting, {InputTypes} from 'components/widgets/settings/text_setting';
import AutocompleteSelector from 'components/autocomplete_selector';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list.jsx';
import BoolSetting from 'components/widgets/settings/bool_setting';
import Provider from 'components/suggestion/provider';

import ButtonSelector from 'components/button_selector';

import AppsFormSelectField from './apps_form_select_field';

export const RequiredStar: React.FC = () => (
    <span className='error-text'>{' *'}</span>
);

const TEXT_DEFAULT_MAX_LENGTH = 150;
const TEXTAREA_DEFAULT_MAX_LENGTH = 3000;

export type Props = {
    field: AppField;
    name: string;
    errorText?: React.ReactNode;
    value: AppSelectOption | string | boolean | number | null;
    onChange: (name: string, value: any) => void;
    autoFocus?: boolean;
    listComponent?: React.ComponentClass,
    performLookup: (name: string, userInput: string) => Promise<AppSelectOption[]>;
    isSubmit: boolean;
    actions: {
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;
        autocompleteUsers: (search: string) => Promise<UserProfile[]>;
    };
}

type State = {
    userInput?: string;
};

export default class AppsFormField extends React.PureComponent<Props, State> {
    private provider?: Provider;

    static defaultProps = {
        listComponent: ModalSuggestionList,
    };

    constructor(props: Props) {
        super(props);

        let defaultText = (props.value as string) || '';
        if (props.value && props.field.type === 'static_select' && props.field.options) {
            const defaultOption = props.field.options.find((option) => option.value === props.value);
            defaultText = defaultOption ? defaultOption.label : '';
        }

        this.state = {
            userInput: defaultText,
        };
    }

    handleSelected = (selected: AppSelectOption | UserProfile | Channel) => {
        const {name, field, onChange} = this.props;

        if (field.type === 'user') {
            const user = selected as UserProfile;
            onChange(name, user.id);
            this.setState({userInput: user.username});
        } else if (field.type === 'channel') {
            const channel = selected as Channel;
            onChange(name, channel.id);
            this.setState({userInput: channel.display_name});
        } else {
            const option = selected as AppSelectOption;
            onChange(name, option);
        }
    }

    getProvider = (): Provider | void => {
        if (this.provider) {
            return this.provider;
        }

        const {actions, field} = this.props;
        if (field.type === 'user') {
            this.provider = new GenericUserProvider(actions.autocompleteUsers);
        } else if (field.type === 'channel') {
            this.provider = new GenericChannelProvider(actions.autocompleteChannels);
        } else if (field.options) {
            const options = field.options.map(({label, value}) => ({text: label, value}));
            this.provider = new MenuActionProvider(options);
        }

        return this.provider;
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

        const placeholder = field.hint;

        const displayName = (field.modal_label || field.label) as string;
        let displayNameContent: React.ReactNode = (field.modal_label || field.label) as string;
        if (field.is_required) {
            displayNameContent = (
                <React.Fragment>
                    {displayName}
                    <RequiredStar/>
                </React.Fragment>
            );
        }

        const helpText = field.description;
        let helpTextContent: React.ReactNode = helpText;
        if (errorText) {
            helpTextContent = (
                <React.Fragment>
                    {helpText}
                    <div className='error-text mt-3'>
                        {errorText}
                    </div>
                </React.Fragment>
            );
        }

        if (field.type === 'text') {
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
        } else if (field.type === 'channel' || field.type === 'user') {
            return (
                <AutocompleteSelector
                    id={name}
                    disabled={field.readonly}
                    providers={[this.getProvider()]}
                    onSelected={this.handleSelected}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    value={this.state.userInput}
                    listComponent={listComponent}
                />
            );
        } else if (field.type === 'static_select' || field.type === 'dynamic_select') {
            if (this.props.isSubmit) {
                const selected = value as AppSelectOption;
                return (
                    <ButtonSelector
                        id={name}
                        options={field.options}
                        onChange={this.handleSelected}
                        label={displayNameContent}
                        helpText={helpTextContent}
                        value={(selected && selected.value) || ''}
                        shouldSubmit={true}
                    />
                );
            }

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
        } else if (field.type === 'bool') {
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

        return null;
    }
}
