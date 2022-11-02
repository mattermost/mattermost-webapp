// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import SwitchSelector from 'react-switch-selector';

import {trackEvent} from 'actions/telemetry_actions';

import './index.scss';

interface Props {
    updatePrice: (isMonthly: boolean) => void;
}

function YearlyMonthlyToggle({updatePrice}: Props) {
    const [isMonthly, setIsMonthly] = useState(true);
    const [toggleBorderClassName, setToggleBorderClassName] = useState('toggle-border');

    const monthlyLabel = 'Monthly';
    const yearlyLabel = 'Yearly';

    const options = [
        {
            label: <p className={isMonthly ? 'text text-unselected' : 'text text-selected'}>{yearlyLabel}</p>,
            value: yearlyLabel,
        },
        {
            label: <p className={isMonthly ? 'text text-selected' : 'text text-unselected'}>{monthlyLabel}</p>,
            value: monthlyLabel,
        },
    ];

    const onToggleChange = (newValue: any) => {
        setIsMonthly(newValue === monthlyLabel);

        // isMonthly variable hasn't been updated to the latest value and currently represents the previous toggle state
        // (ie. UI shows monthly selected but the isMonthly variable is still false at this point)

        // controls the animation of the toggle border
        if (isMonthly) {
            setToggleBorderClassName('toggle-border move-left');
        } else {
            setToggleBorderClassName('toggle-border move-right');
        }

        trackEvent('cloud_pricing', 'click_yearly_toggle');

        // update the displayed price
        updatePrice(!isMonthly);
    };

    const initialSelectedIndex = options.findIndex(({value}) => value === 'Monthly');

    return (
        <div className='toggle-monthly-yearly-container'>
            <div className={toggleBorderClassName}/>
            <div className='toggle-monthly-yearly'>
                <SwitchSelector
                    onChange={onToggleChange}
                    options={options}
                    initialSelectedIndex={initialSelectedIndex}
                    backgroundColor={'border: 1px solid red'}
                    border={'solid 1px rgba(var(--title-color-indigo-500-rgb), 0.4)'}
                    selectionIndicatorMargin={0}
                    selectedBackgroundColor={'rgba(var(--denim-button-bg-rgb), 0.08)'}
                    wrapperBorderRadius={40}
                    optionBorderRadius={40}
                />
            </div>
        </div>
    );
}

export default YearlyMonthlyToggle;
