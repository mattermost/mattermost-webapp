// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactSelect from 'react-select';

import {FormattedMessage} from 'react-intl';

import {AppBinding} from '@mattermost/types/apps';

import {CommonProps} from './common_props';
import Dropdown from './dropdown';

export default function Select(props: CommonProps) {
    const variants: Record<string, React.ElementType> = {
        categories: SelectVariantCategories,
        button: SelectVariantButton,
        select: SelectVariantNormal,
    };

    let variant = props.binding.subtype;
    if (!variant) {
        variant = 'select';
    }

    const SelectVariant = variants[variant];
    if (!SelectVariant) {
        return <span>{'unknown variant ' + variant}</span>;
    }

    return (
        <div className='mm-app-bar-rhs-binding-select'>
            <SelectVariant {...props}/>
        </div>
    );
}

function SelectButton(props: CommonProps) {
    return (
        <button
            type='button'
            className='save-button btn btn-primary'
        >
            {props.binding.label}
        </button>
    );
}

function SelectVariantButton(props: CommonProps) {
    return (
        <Dropdown
            {...props}
            onSelect={props.handleBindingClick}
            Button={SelectButton}
            hint={props.binding.hint || (
                <FormattedMessage
                    id={'the.id'}
                    defaultMessage={'Actions'}
                />
            )}
        />
    );
}

function SelectVariantCategories(props: CommonProps) {
    const [selected, setSelected] = useState<AppBinding | null>(null);

    const options = props.binding.bindings;
    const {handleBindingClick} = props;

    useEffect(() => {
        if (selected) {
            return;
        }

        const options = props.binding.bindings;
        if (!options?.length) {
            return;
        }

        for (const option of options) {
            if (option.selected) {
                setSelected(option);
                return;
            }
        }

        setSelected(options[0]);
    }, [options, selected, props.binding.bindings]);

    const onSelect = useCallback((value: AppBinding) => {
        const option = options?.find((opt) => opt.location === value.location);
        if (!option) {
            return;
        }

        setSelected(option);

        handleBindingClick(option);
    }, [options, handleBindingClick]);

    const label = selected?.label || 'No selected option';

    const CategoriesButton = () => (
        <h3 style={{cursor: 'pointer'}}>
            {label}
        </h3>
    );

    return (
        <div>
            <Dropdown
                {...props}
                Button={CategoriesButton}
                onSelect={onSelect}
                hint={props.binding.hint || (
                    <FormattedMessage
                        id={'the.id'}
                        defaultMessage={'Categories'}
                    />
                )}
            />
        </div>
    );
}

function SelectVariantNormal(props: CommonProps) {
    const [selected, setSelected] = useState<AppBinding | null>(null);

    const options = props.binding.bindings;

    useEffect(() => {
        if (selected) {
            return;
        }

        const options = props.binding.bindings;
        if (!options?.length) {
            return;
        }

        for (const option of options) {
            if (option.selected) {
                setSelected(option);
                return;
            }
        }

        setSelected(options[0]);
    }, [options, selected]);

    const onSelect = useCallback((value) => {
        const option = options?.find((opt) => opt.location === value.value);
        if (!option) {
            return;
        }

        setSelected(option);

        props.handleBindingClick(option);
    }, [options, props.handleBindingClick]);

    const selectOptions = useMemo(() => {
        if (!options) {
            return [];
        }

        return options.map((b) => ({
            value: b.location,
            label: b.label,
        }));
    }, [options]);

    if (!options?.length) {
        return <span>{'No select options provided'}</span>;
    }

    const selectedOption = selectOptions.find((opt) => opt.value === selected?.location);

    return (
        <div>
            <div>
                <ReactSelect
                    className='react-select react-select-top'
                    classNamePrefix='react-select'
                    id='displayTimezone'
                    menuPortalTarget={document.body}
                    styles={reactStyles}
                    options={selectOptions}
                    clearable={false}
                    onChange={onSelect}
                    value={selectedOption}
                />
            </div>
        </div>
    );
}

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
    }),

};
