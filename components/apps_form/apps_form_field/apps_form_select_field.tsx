// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Props as AsyncSelectProps} from 'react-select/async';
import ReactSelect from 'react-select';

import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {AppField, AppSelectOption} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import Constants from 'utils/constants.jsx';

import OverlayTrigger from 'components/overlay_trigger';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<AppSelectOption>>; // eslint-disable-line global-require

type SelectValue = AppSelectOption | AppSelectOption[] | null;

export type Props = {
    field: AppField;
    label: React.ReactNode;
    helpText: React.ReactNode;
    value: AppSelectOption | null;
    onChange: (value: SelectValue) => void;
    onClear: () => void;
    performLookup: (name: string, userInput: string) => Promise<AppSelectOption[]>;
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
            menuPlacement: 'bottom',
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

    renderDynamicSelect() {
        const {field} = this.props;
        const commonProps = this.getCommonProps();

        return (
            <div className={'react-select'}>
                <AsyncSelect
                    id={`AppsDynamicSelect_${field.name}`}
                    loadOptions={this.loadDynamicOptions}
                    defaultOptions={true}
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

    render() {
        const {field, label, helpText} = this.props;

        let selectComponent;
        if (field.type === AppFieldTypes.DYNAMIC_SELECT) {
            selectComponent = this.renderDynamicSelect();
        } else if (field.type === AppFieldTypes.STATIC_SELECT) {
            selectComponent = this.renderStaticSelect();
        } else {
            return null;
        }

        return (
            <div className='form-group'>
                <label>
                    {label}
                </label>
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
