// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AsyncSelect, {Props as AsyncSelectProps} from 'react-select/async';

import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';

import ReactSelect from 'react-select';

import OverlayTrigger from 'components/overlay_trigger';

import {AppField, AppSelectOption} from '@mattermost/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {Channel} from '@mattermost/types/channels';
import {UserAutocomplete} from '@mattermost/types/autocomplete';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {imageURLForUser} from 'utils/utils';

type SelectValue = AppSelectOption | AppSelectOption[] | null;

export type Props = {
    field: AppField;
    label: React.ReactNode;
    helpText: React.ReactNode;
    value: AppSelectOption | null;
    onChange: (value: SelectValue) => void;
    onClear: () => void;
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

    getCommonProps = (): Partial<AsyncSelectProps<AppSelectOption>> => {
        const {field} = this.props;
        const placeholder = field.hint || '';
        const value = this.props.value;

        return {
            value,
            placeholder,
            isDisabled: field.readonly,
            onChange: this.onChange as any, // types are not working correctly for multiselect
            isMulti: field.multiselect || false,
            isClearable: true,
            openMenuOnFocus: false,
            classNamePrefix: 'react-select-auto react-select',
            menuPortalTarget: document.body,
            styles: reactStyles,
            menuPlacement: 'auto',
            components: {
                MultiValueLabel: (props) => (
                    <div className='react-select__padded-component'>
                        {props.data.label}
                    </div>
                ),

                // Remove separator between chevron and clear button, to match our autocomplete's styling
                IndicatorSeparator: () => null,

                // Use custom clear button, to match our autocomplete's styling
                ClearIndicator: this.renderClearComponent,
            },
        };
    }

    onClear = (e: React.UIEvent) => {
        e.stopPropagation();
        this.props.onClear();
    }

    onChange = (selectedOption: SelectValue) => {
        this.props.onChange(selectedOption);
    }

    loadDynamicOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        return this.props.performLookup(this.props.field.name, userInput);
    }

    loadDynamicUserOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        const usersSearchResults: UserAutocomplete = await this.props.actions.autocompleteUsers(userInput.toLowerCase());

        return usersSearchResults.users.map((user) => {
            const label = this.props.teammateNameDisplay ? displayUsername(user, this.props.teammateNameDisplay) : user.username;

            return {...user, label, value: user.id, icon_data: imageURLForUser(user.id)};
        });
    }

    loadDynamicChannelOptions = async (userInput: string): Promise<AppSelectOption[]> => {
        let channelsSearchResults: Channel[] = [];

        await this.props.actions.autocompleteChannels(userInput.toLowerCase(), (data) => {
            channelsSearchResults = data;
        }, () => {});

        return channelsSearchResults.map((channel) => ({...channel, label: channel.display_name, value: channel.id}));
    }

    renderDynamicSelect() {
        const {field} = this.props;
        const commonProps = this.getCommonProps();

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`AppsDynamicSelect_${field.name}`}
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
        const {hint, name, multiselect, readonly} = this.props.field;
        const placeholder = hint || '';
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`MultiInput_${name}`}
                    loadOptions={this.loadDynamicUserOptions}
                    defaultOptions={true}
                    isMulti={multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={readonly}
                    components={{...commonComponents, Option: SelectUserOption}}
                    {...commonProps}
                />
            </div>
        );
    }

    renderChannelSelect() {
        const {hint, name, multiselect, readonly} = this.props.field;
        const placeholder = hint || '';
        const value = this.props.value;

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`MultiInput_${name}`}
                    loadOptions={this.loadDynamicChannelOptions}
                    defaultOptions={true}
                    isMulti={multiselect || false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    isDisabled={readonly}
                    components={{...commonComponents, Option: SelectChannelOption}}
                    {...commonProps}
                />
            </div>
        );
    }

    renderStaticSelect() {
        const {field} = this.props;
        const options = field.options;
        const commonProps = this.getCommonProps();

        return (
            <div className={'react-select'}>
                <ReactSelect
                    id={`AppsStaticSelect_${field.name}`}
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

    renderClearComponent = () => {
        if (this.props.field.multiselect) {
            return null;
        }

        const clearableTooltip = (
            <Tooltip id={'InputClearTooltip'}>
                <FormattedMessage
                    id={'input.clear'}
                    defaultMessage='Clear'
                />
            </Tooltip>
        );

        return (
            <div
                className='input-clear visible'
                onMouseDown={this.onClear}
                onTouchEnd={this.onClear}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement={'bottom'}
                    overlay={clearableTooltip}
                >
                    <span
                        className='input-clear-x'
                        aria-hidden='true'
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        );
    }

    getAppFieldRenderer(type: string) {
        switch (type) {
        case AppFieldTypes.DYNAMIC_SELECT:
            return this.renderDynamicSelect();
        case AppFieldTypes.STATIC_SELECT:
            return this.renderStaticSelect();
        case AppFieldTypes.USER:
            return this.renderUserSelect();
        case AppFieldTypes.CHANNEL:
            return this.renderChannelSelect();
        default:
            return undefined;
        }
    }

    render() {
        const {field, label, helpText} = this.props;

        const selectComponent = this.getAppFieldRenderer(field.type);

        return (
            <div
                className='form-group'
            >
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
