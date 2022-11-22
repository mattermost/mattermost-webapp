// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {useIntl} from 'react-intl';

import SwitchSelector from 'react-switch-selector';

import {trackEvent} from 'actions/telemetry_actions';

import './index.scss';

interface Props {
    updatePrice: (isMonthly: boolean) => void;
}

function YearlyMonthlyToggle({updatePrice}: Props) {
    const {formatMessage} = useIntl();
    const [isMonthly, setIsMonthly] = useState(true);
    const [toggleBorderClassName, setToggleBorderClassName] = useState('toggle-border');

    const monthlyLabel = formatMessage({id: 'pricing_modal.monthly', defaultMessage: 'Monthly'});
    const yearlyLabel = formatMessage({id: 'pricing_modal.yearly', defaultMessage: 'Yearly'});

    // handle Enter key being pressed when using Tab to navigate the page
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onToggleChange();

            // click on the unselected label
            const yearlyLabelElement = document.getElementById('text-unselected');
            yearlyLabelElement?.click();
        }
    };

    const options = [
        {
            label: (
                <p
                    className={'text'}
                    id={isMonthly ? 'text-unselected' : 'text-selected'}
                >
                    {yearlyLabel}
                </p>
            ),
            value: yearlyLabel,
        },
        {
            label: (
                <p
                    className={'text'}
                    id={isMonthly ? 'text-selected' : 'text-unselected'}
                >
                    {monthlyLabel}
                </p>
            ),
            value: monthlyLabel,
        },
    ];

    const onToggleChange = () => {
        setIsMonthly(!isMonthly);

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
            <div
                className='toggle-monthly-yearly'
                tabIndex={0}
                onKeyPress={handleKeyDown}
            >
                <SwitchSelector
                    onChange={onToggleChange}
                    options={options}
                    initialSelectedIndex={initialSelectedIndex}
                    backgroundColor={''}
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
