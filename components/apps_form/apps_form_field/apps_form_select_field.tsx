// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';

import {AppField, AppSelectOption} from 'mattermost-redux/types/apps';

export type FormValue = string | AppSelectOption | null;
export type FormValues = {[name: string]: FormValue};

export type Props = {
    field: AppField;
    label: React.ReactNode;
    value: AppSelectOption | null;
    onChange: (value: AppSelectOption) => void;
    performLookup: (name: string, userInput: string) => Promise<AppSelectOption[]>;
};

export type State = {
    refreshNonce: string;
    field: AppField;
}

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

    renderDynamicSelect() {
        const {field} = this.props;

        const placeholder = field.hint || '';

        const value = this.props.value || [];

        // const value = (this.props.value && options.find((opt) => opt.value === this.props.value.value)) || {};

        return (
            <div className='form-group'>
                <AsyncSelect
                    id={`MultiInput_${field.name}`}
                    loadOptions={this.loadDynamicOptions}
                    defaultOptions={true}
                    isMulti={field.multiselect || false}
                    isClearable={true}
                    openMenuOnFocus={false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    classNamePrefix='react-select-auto react-select'
                />
            </div>
        );
    }

    renderStaticSelect() {
        const {field} = this.props;

        const placeholder = field.hint || '';

        const options = field.options || [];
        const value = this.props.value || {};

        // const value = (this.props.value && options.find((opt) => opt.value === this.props.value.value)) || {};

        return (
            <div className='form-group'>
                <ReactSelect
                    id={`MultiInput_${field.name}`}
                    options={options}
                    isMulti={field.multiselect || false}
                    isClearable={true}
                    openMenuOnFocus={false}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.onChange as any} // types are not working correctly for multiselect
                    classNamePrefix='react-select-auto react-select'
                />
            </div>
        );
    }

    render() {
        const {field, label} = this.props;

        let selectComponent;
        if (field.type === 'dynamic_select') {
            selectComponent = this.renderDynamicSelect();
        } else if (field.type === 'static_select') {
            selectComponent = this.renderStaticSelect();
        } else {
            return null;
        }

        return (
            <div>
                <p>
                    {label}
                </p>
                {[
                    <React.Fragment key={this.state.refreshNonce}>
                        {selectComponent}
                    </React.Fragment>,
                ]}
            </div>
        );
    }
}
