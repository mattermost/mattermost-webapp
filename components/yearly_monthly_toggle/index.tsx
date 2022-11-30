// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {useIntl} from 'react-intl';

import SwitchSelector from 'react-switch-selector';

import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';

import './index.scss';

import {TELEMETRY_CATEGORIES} from 'utils/constants';

interface Props {
    updatePrice: (isMonthly: boolean) => void;
    isPurchases: boolean;
    isInitialPlanMonthly: boolean;
}

function YearlyMonthlyToggle(props: Props) {
    const {formatMessage} = useIntl();
    const [isMonthly, setIsMonthly] = useState(props.isInitialPlanMonthly);
    const [moveBorder, setMoveBorder] = useState(false);

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
                    className={'label-text'}
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
                    className={'label-text'}
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

        // After the toggle has been clicked, moveBorder will always be true so it can continue to move if clicked again.
        if (!moveBorder) {
            setMoveBorder(true);
        }

        const telemetryCategory = props.isPurchases ? TELEMETRY_CATEGORIES.CLOUD_PURCHASING : TELEMETRY_CATEGORIES.CLOUD_PRICING;
        trackEvent(telemetryCategory, 'click_yearly_toggle');

        // update the displayed price
        props.updatePrice(!isMonthly);
    };

    const initialPlan = (props.isInitialPlanMonthly) ? monthlyLabel : yearlyLabel;
    const initialSelectedIndex = options.findIndex(({value}) => value === initialPlan);

    return (
        <div className='toggle-monthly-yearly-container'>
            <div
                className={classNames({
                    'toggle-border': true,
                    'toggle-border-yearly': !props.isInitialPlanMonthly,
                    'move-border': moveBorder,
                    'move-left': moveBorder && !isMonthly,
                    'move-right': moveBorder && isMonthly,
                })}
            />
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
