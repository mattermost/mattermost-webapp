// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {DayModifiers, NavbarElementProps} from 'react-day-picker';

import './daypicker.scss';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentLocale} from 'selectors/i18n';
import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getCurrentDateForTimezone} from 'utils/timezone';

const Navbar: React.FC<Partial<NavbarElementProps>> = (navbarProps: Partial<NavbarElementProps>) => {
    const {
        onPreviousClick,
        onNextClick,
        className,
    } = navbarProps;
    const styleLeft: React.CSSProperties = {
        float: 'left',
    };
    const styleRight: React.CSSProperties = {
        float: 'right',
    };
    return (
        <div className={className}>
            <button
                className='style--none'
                style={styleLeft}
                onClick={(e) => {
                    e.preventDefault();
                    if (onPreviousClick) {
                        onPreviousClick();
                    }
                }}
            >
                <svg
                    width='10'
                    height='16'
                    viewBox='0 0 10 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M9.878 1.91605L8.528 0.566049L1.094 8.00005L8.528 15.434L9.878 14.066L3.794 8.00005L9.878 1.91605ZM9.5 1.84405L8.15 0.494048L0.5 8.00005L8.15 15.506L9.5 14.156L3.2 8.00005L9.5 1.84405Z'
                        fill='#3D3C40'
                        fillOpacity='0.32'
                    />
                </svg>
            </button>
            <button
                className='style--none'
                style={styleRight}
                onClick={(e) => {
                    e.preventDefault();
                    if (onNextClick) {
                        onNextClick();
                    }
                }}
            >
                <svg
                    width='10'
                    height='16'
                    viewBox='0 0 10 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M0.41 2.09605L6.314 8.00005L0.41 13.904L1.994 15.506L9.5 8.00005L1.994 0.494048L0.41 2.09605Z'
                        fill='#3D3C40'
                        fillOpacity='0.56'
                    />
                </svg>
            </button>
        </div>
    );
};

const DateTimeInputContainer: React.FC = () => {
    const [day, setDay] = useState('Today');
    const currentUserId = useSelector(getCurrentUserId);
    const userTimezone = useSelector((state: GlobalState) => getUserTimezone(state, currentUserId));
    const locale = useSelector(getCurrentLocale);

    const enableTimezone = useSelector(areTimezonesEnabledAndSupported);

    let currentDate;
    if (enableTimezone) {
        if (userTimezone.useAutomaticTimezone) {
            currentDate = getCurrentDateForTimezone(userTimezone.automaticTimezone);
        } else {
            currentDate = getCurrentDateForTimezone(userTimezone.manualTimezone);
        }
    } else {
        currentDate = new Date();
    }

    const handleDayChange = (day: Date, modifiers: DayModifiers) => {
        if (modifiers.today) {
            setDay('Today');
        } else {
            setDay(day.toString());
        }
    };

    const modifiers = {
        today: currentDate,
    };

    return (
        <div className='dateTime'>
            <div className='dateTime__date-input'>
                <span className='dateTime__input-title'>{'Date'}</span>
                <span className='dateTime__date-icon'>
                    <i
                        className='fa fa-calendar'
                        aria-hidden='true'
                    />
                </span>
                <DayPickerInput
                    value={day}
                    onDayChange={handleDayChange}
                    inputProps={{
                        readOnly: true,
                    }}
                    dayPickerProps={{
                        navbarElement: <Navbar/>,
                        fromMonth: currentDate,
                        modifiers,
                        locale: locale.toLowerCase(),
                    }}
                />
            </div>
            <div className='dateTime__time-input'>
                <span className='dateTime__input-title'>{'Time'}</span>
                <span className='dateTime__time-icon'>
                    <i
                        className='fa fa-clock-o'
                        aria-hidden='true'
                    />
                </span>
                <input value='12:30 PM'/>
            </div>
        </div>
    );
};

export default DateTimeInputContainer;
