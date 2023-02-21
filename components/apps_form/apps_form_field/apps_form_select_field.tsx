// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AsyncSelect, {Props as AsyncSelectProps} from 'react-select/async';

import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import ReactSelect, {ValueType} from 'react-select';

import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';

import {AppField, AppSelectOption} from '@mattermost/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {Channel} from '@mattermost/types/channels';
import {UserAutocomplete} from '@mattermost/types/autocomplete';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {imageURLForUser} from 'utils/utils';

import {SelectChannelOption} from './select_channel_option';
import {SelectUserOption} from './select_user_option';

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
        const {field, value} = this.props;

        return {
            value,
            onChange: this.onChange,
            placeholder: field.hint || '',
            isDisabled: field.readonly,
            isMulti: field.multiselect || false,
            isClearable: true,
            openMenuOnFocus: false,
            classNamePrefix: 'react-select-auto react-select',
            menuPortalTarget: document.body,
            styles: reactStyles,
            menuPlacement: 'auto',
            components: this.getSharedComponents(),
        };
    }

    getSharedComponents = () => ({
        MultiValueLabel: (props: {data: {label: string}}) => (
            <div className='react-select__padded-component'>
                {props.data.label}
            </div>
        ),

        // Remove separator between chevron and clear button, to match our autocomplete's styling
        IndicatorSeparator: () => null,

        // Use custom clear button, to match our autocomplete's styling
        ClearIndicator: this.renderClearComponent,
    });

    onClear = (e: React.UIEvent) => {
        e.stopPropagation();
        this.props.onClear();
    }

    onChange = (selectedOption?: ValueType<AppSelectOption>) => {
        const opt = (selectedOption || null) as SelectValue;
        this.props.onChange(opt);
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

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    {...this.getSharedComponents()}
                    id={`AppsDynamicSelect_${field.name}`}
                    loadOptions={this.loadDynamicOptions}
                    defaultOptions={true}
                    components={this.getSharedComponents()}
                />
            </div>
        );
    }

    renderUserSelect() {
        return (
            <div className={'react-select'}>
                <AsyncSelect
                    {...this.getSharedComponents()}
                    id={`MultiInput_${name}`}
                    loadOptions={this.loadDynamicUserOptions}
                    defaultOptions={true}
                    components={{...this.getSharedComponents(), Option: SelectUserOption}}
                />
            </div>
        );
    }

    renderChannelSelect() {
        return (
            <div className={'react-select'}>
                <AsyncSelect
                    {...this.getCommonProps()}
                    id={`MultiInput_${name}`}
                    loadOptions={this.loadDynamicChannelOptions}
                    defaultOptions={true}
                    components={{...this.getSharedComponents(), Option: SelectChannelOption}}
                />
            </div>
        );
    }

    renderStaticSelect() {
        const {field} = this.props;
        const options = field.options;

        return (
            <div className={'react-select'}>
                <ReactSelect
                    {...this.getCommonProps()}
                    id={`AppsStaticSelect_${field.name}`}
                    options={options}
                    components={this.getSharedComponents()}
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
