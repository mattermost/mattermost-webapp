// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type RadioGroupProps = {
    id: string;
    values: Array<{ key: string; value: string}>;
    value: string;
    isDisabled: Function;
    onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}
const RadioButtonGroup: React.FC<RadioGroupProps> = (props) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(e);
    };

    const options = [];
    for (const {value, key} of props.values) {
        const disabled = props.isDisabled ? props.isDisabled(value) : false;
        options.push(
            <div
                className='radio'
                key={value}
            >
                <label className={value === props.value ? 'selected' : ''}>
                    <input
                        type='radio'
                        value={value}
                        name={props.id}
                        checked={value === props.value}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                    {key}
                </label>
            </div>,
        );
    }

    return (
        <>
            {options}
        </>
    );
};

export default RadioButtonGroup;
