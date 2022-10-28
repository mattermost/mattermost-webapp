import React, {useState} from 'react';

import {trackEvent} from 'actions/telemetry_actions';

import SwitchSelector from "react-switch-selector";

import './index.scss';

interface Props {
    updatePrice: Function;
}

function YearlyMonthlyToggle({ updatePrice }: Props) {
    const [isMonthly, setIsMonthly] = useState(true);
    const [toggleBorderClassName, setToggleBorderClassName] = useState('toggle-border');
    
    const options = [
        {
            label: <p style={{margin: "10px 16px", color: isMonthly ? 'var(--center-channel-text)' : 'var(--denim-button-bg)'}}>Yearly</p>,
            value: "Yearly",
        },
        {
            label: <p style={{margin: "10px 16px", color: isMonthly ? 'var(--denim-button-bg)' : 'var(--center-channel-text)'}}>Monthly</p>,
            value: "Monthly",
        }
     ];
     
    const onToggleChange = () => {
        setIsMonthly(!isMonthly);

        // isMonthly variable hasn't been updated to the latest value and currently represents the previous toggle state 
        // (ie. UI shows monthly selected but the isMonthly variable is still false at this point)

        // controls the animation of the toggle border
        if (isMonthly) {
            setToggleBorderClassName("toggle-border move-left");
            trackEvent('cloud_pricing', 'click_yearly_toggle');
        } else {
            setToggleBorderClassName("toggle-border move-right");
        }

        // update the displayed price
        updatePrice(!isMonthly);
    };
     
    const initialSelectedIndex = options.findIndex(({value}) => value === "Monthly");

    return (
        <div className="toggle-monthly-yearly-container">
            <div className={toggleBorderClassName}></div>
            <div className="toggle-monthly-yearly">
                <SwitchSelector
                    onChange={onToggleChange}
                    options={options}
                    initialSelectedIndex={initialSelectedIndex}
                    backgroundColor={"border: 1px solid red"}
                    border={"solid 1px rgba(var(--title-color-indigo-500-rgb), 0.4)"}
                    selectionIndicatorMargin={0}
                    selectedBackgroundColor={'rgba(var(--denim-button-bg-rgb), 0.08)'}
                    wrapperBorderRadius={40}
                    optionBorderRadius={40}
                />
            </div>
        </div>
    )
}

export default YearlyMonthlyToggle;