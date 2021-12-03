// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import Badge from 'components/widgets/badges/badge';

type RadioGroupProps = {
    id: string;
    values: Array<{ key: React.ReactNode | React.ReactNodeArray; value: string; testId?: string}>;
    value: string;
    badge?: {matchVal: string; text: ReactNode};
    sideLegend?: {matchVal: string; text: ReactNode};
    isDisabled?: (id: string) => boolean | boolean;
    onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}
const RadioButtonGroup: React.FC<RadioGroupProps> = ({
    id,
    onChange,
    isDisabled,
    values,
    value,
    badge,
    sideLegend,
}: RadioGroupProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
    };

    const options = [];
    for (const {value: val, key, testId} of values) {
        const disabled = isDisabled ? isDisabled(val) : false;
        const moreProps: {'data-testid'?: string} = {};
        if (testId) {
            moreProps['data-testid'] = testId;
        }
        options.push(
            <div
                className='radio'
                key={val}
            >
                <label className={val === value ? 'selected' : ''}>
                    <input
                        type='radio'
                        value={val}
                        name={id}
                        checked={val === value}
                        onChange={handleChange}
                        disabled={disabled}
                        {...moreProps}
                    />
                    {key}
                    {(sideLegend && val === sideLegend?.matchVal) &&
                        <span className='side-legend'>
                            {sideLegend.text}
                        </span>
                    }
                </label>
                {(badge && val === badge?.matchVal) &&
                    <Badge className='radio-badge'>
                        {badge.text}
                    </Badge>
                }
            </div>,
        );
    }

    return (
        <div className='radio-list'>
            {options}
        </div>
    );
};

export default RadioButtonGroup;
