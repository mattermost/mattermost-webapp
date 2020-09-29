
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {getName} from 'country-list';
import Select, {StylesConfig} from 'react-select';

import Input from 'components/input';

import {US_STATES, CA_PROVINCES, StateCode} from 'components/cloud/utils/states';

type Props = {
    country: string;
    state: string;
    onChange: (newValue: string) => void;
    onBlur?: () => void;
}

// StateSelector will display a state dropdown for US and Canada.
// Will display a open text input for any other country.
export default function StateSelector(props: Props) {
    // Making TS happy here with the react-select event handler
    const onStateSelected = (option: any) => {
        props.onChange(option.value);
    };

    let stateList = [] as StateCode[];
    if (props.country === getName('US')) {
        stateList = US_STATES;
    } else if (props.country === getName('CA')) {
        stateList = CA_PROVINCES;
    }

    if (stateList.length > 0) {
        return (
            <Select
                placeholder='State'
                name='state'
                components={{IndicatorSeparator: null}}
                isSearchable={false}
                id='payment_state'
                options={stateList.map((stateCode) => ({value: stateCode.code, label: stateCode.name}))}
                styles={selectorStyles}
                onChange={onStateSelected}
                value={props.state ? {value: props.state, label: props.state} : null}
                menuPlacement={'auto'}
                onBlur={props.onBlur}
            />
        );
    }

    return (
        <Input
            name='state'
            type='text'
            value={props.state}
            onChange={(e) => {
                props.onChange(e.target.value);
            }}
            onBlur={props.onBlur}
            placeholder='State/Province'
            required={true}
        />);
}

const selectorStyles: StylesConfig = {
    placeholder: (provided) => ({
        ...provided,

        color: 'var(--center-channel-color-64)',
        opacity: 0.5,
        fontSize: '14px',
        padding: '2px',

    }),
    valueContainer: (provided) => ({...provided, height: '40px'}),
    menu: (provided) => ({...provided, zIndex: 5}),
};

