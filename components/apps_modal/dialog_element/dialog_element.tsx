// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {AppField} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

import TextSetting, {InputTypes} from 'components/widgets/settings/text_setting';
import AutocompleteSelector from 'components/autocomplete_selector';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list.jsx';
import BoolSetting from 'components/widgets/settings/bool_setting';
import RadioSetting from 'components/widgets/settings/radio_setting';
import ButtonSelector from 'components/button_selector';
import Provider from 'components/suggestion/provider';

const TEXT_DEFAULT_MAX_LENGTH = 150;
const TEXTAREA_DEFAULT_MAX_LENGTH = 3000;

type StaticOption = {text: string; value: string};

export type Props = {
    field: AppField;
    displayName: string;
    name: string;
    type: string;
    subtype?: string;
    placeholder?: string;
    helpText?: string;
    errorText?: React.ReactNode;
    minLength?: number;
    maxLength?: number;
    dataSource?: string;
    optional?: boolean;
    options: Array<{text: string; value: string}> | null;
    value: string | boolean | number | null;
    onChange: (name: string, value: any) => void;
    autoFocus?: boolean;
    listComponent?: React.ComponentClass;
    actions: {
        autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;
        autocompleteUsers: (search: string) => Promise<UserProfile[]>;
    };
}

type State = {
    value?: string;
};

export default class DialogElement extends React.PureComponent<Props, State> {
    private provider?: Provider;

    static defaultProps = {
        listComponent: ModalSuggestionList,
    };

    constructor(props: Props) {
        super(props);

        let defaultText = '';
        if (props.type === 'select') {
            if (props.value && props.options) {
                const defaultOption = props.options.find((option) => option.value === props.value);
                defaultText = defaultOption ? defaultOption.text : '';
            }
        }

        this.state = {
            value: defaultText,
        };
    }

    // // Function added for dynamic App modals
    // componentDidUpdate(prevProps: Props) {
    //     if (prevProps.field !== this.props.field) {
    //         const {value} = this.props.field;
    //         this.setState({value});
    //         this.props.onChange(this.props.name, value);
    //     }
    // }

    handleSelected = (selected: StaticOption | UserProfile | Channel) => {
        const {name, dataSource, onChange} = this.props;

        if (dataSource === 'users') {
            const user = selected as UserProfile;
            onChange(name, user.id);
            this.setState({value: user.username});
        } else if (dataSource === 'channels') {
            const channel = selected as Channel;
            onChange(name, channel.id);
            this.setState({value: channel.display_name});
        } else {
            const option = selected as StaticOption;
            onChange(name, option.value);
            this.setState({value: option.text});
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
            name,
            subtype,
            displayName,
            value,
            placeholder,
            onChange,
            helpText,
            errorText,
            optional,
            options,
            listComponent,
        } = this.props;

        let {type, maxLength} = this.props;

        let displayNameContent: React.ReactNode = displayName;
        if (optional) {
            displayNameContent = (
                <React.Fragment>
                    {displayName + ' '}
                    <span className='font-weight--normal light'>
                        <FormattedMessage
                            id='interactive_dialog.element.optional'
                            defaultMessage='(optional)'
                        />
                    </span>
                </React.Fragment>
            );
        } else {
            displayNameContent = (
                <React.Fragment>
                    {displayName}
                    <span className='error-text'>{' *'}</span>
                </React.Fragment>
            );
        }

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

        if (type === 'text' || type === 'textarea') {
            if (type === 'text') {
                maxLength = maxLength || TEXT_DEFAULT_MAX_LENGTH;

                if (subtype && TextSetting.validTypes.includes(subtype)) {
                    type = subtype;
                } else {
                    type = 'input';
                }
            } else {
                maxLength = maxLength || TEXTAREA_DEFAULT_MAX_LENGTH;
            }

            const textType = type as InputTypes;
            const textValue = value as string;
            return (
                <TextSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
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
        } else if (type === 'select') {
            switch (subtype) {
            case 'button':
                return (
                    <ButtonSelector
                        id={name}
                        options={this.props.options}
                        onChange={onChange}
                        label={displayNameContent}
                        helpText={helpTextContent}
                        value={value || ''}
                        shouldSubmit={false}
                    />
                );
            case 'submit':
                return (
                    <ButtonSelector
                        id={name}
                        options={this.props.options}
                        onChange={onChange}
                        label={displayNameContent}
                        helpText={helpTextContent}
                        value={value || ''}
                        shouldSubmit={true}
                    />
                );
            default:
                return (
                    <AutocompleteSelector
                        id={name}
                        providers={[this.getProvider()]}
                        onSelected={this.handleSelected}
                        label={displayNameContent}
                        helpText={helpTextContent}
                        placeholder={placeholder}
                        value={this.state.value}
                        listComponent={listComponent}
                        listStyle='bottom'
                    />
                );
            }
        } else if (type === 'bool') {
            const boolValue = value as boolean;
            return (
                <BoolSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
                    label={displayNameContent}
                    value={boolValue || false}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    onChange={onChange}
                />
            );
        } else if (type === 'radio') {
            const radioValue = value as string;
            return (
                <RadioSetting
                    id={name}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    options={options || []}
                    value={radioValue}
                    onChange={onChange}
                />
            );
        }

        return null;
    }
}
