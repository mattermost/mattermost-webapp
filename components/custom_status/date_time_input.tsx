// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {DayModifiers, NavbarElementProps} from 'react-day-picker';

import moment from 'moment-timezone';

import {localizeMessage} from 'utils/utils';
import {getCurrentLocale} from 'selectors/i18n';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {Constants} from 'utils/constants';
import Timestamp from 'components/timestamp';
import {getCurrentDateAndTimeForTimezone} from 'utils/timezone';

const Navbar: React.FC<Partial<NavbarElementProps>> = (navbarProps: Partial<NavbarElementProps>) => {
    const {
        onPreviousClick,
        onNextClick,
        className,
    } = navbarProps;
    const styleLeft: React.CSSProperties = {
        float: 'left',
        fontSize: 18,
    };
    const styleRight: React.CSSProperties = {
        float: 'right',
        fontSize: 18,
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
                <i
                    className='fa fa-angle-left'
                    aria-hidden='true'
                />
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
                <i
                    className='fa fa-angle-right'
                    aria-hidden='true'
                />
            </button>
        </div>
    );
};

const {CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES} = Constants;
export function getRoundedTime(value: Date) {
    const roundedTo = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    const start = moment(value);
    const diff = start.minute() % roundedTo;
    if (diff === 0) {
        return value;
    }
    const remainder = roundedTo - diff;
    return moment(start).add(remainder, 'm').seconds(0).milliseconds(0).toDate();
}

const getDateInIntervals = (startTime: Date): Date[] => {
    const interval = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    let time = startTime;
    const nextDay = moment(startTime).add(1, 'days').startOf('day').toDate();
    const intervals: Date[] = [];
    while (time < nextDay) {
        intervals.push(time);
        time = moment(time).add(interval, 'minutes').seconds(0).milliseconds(0).toDate();
    }

    return intervals;
};

type Props = {
    time: Date;
    handleChange: (date: Date) => void;
    timezone?: string;
}

const DateTimeInputContainer: React.FC<Props> = (props: Props) => {
    const locale = useSelector(getCurrentLocale);
    const {time, handleChange, timezone} = props;
    const [timeOptions, setTimeOptions] = useState<Date[]>([]);

    const setTimeAndOptions = () => {
        const currentTime = timezone ? getCurrentDateAndTimeForTimezone(timezone) : new Date();
        let startTime = moment(time).startOf('day').toDate();
        if (time.getDate() === currentTime.getDate()) {
            startTime = getRoundedTime(currentTime);
        }
        setTimeOptions(getDateInIntervals(startTime));
    };

    useEffect(setTimeAndOptions, [time]);

    const handleDayChange = (day: Date, modifiers: DayModifiers) => {
        if (modifiers.today) {
            const currentTime = timezone ? getCurrentDateAndTimeForTimezone(timezone) : new Date();
            const roundedTime = getRoundedTime(currentTime);
            handleChange(roundedTime);
        } else {
            const dateWithProperTime = moment(day).startOf('day').toDate();
            handleChange(dateWithProperTime);
        }
    };

    const handleTimeChange = (e: React.MouseEvent, time: Date) => {
        e.preventDefault();
        handleChange(time);
    };

    const currentTime = timezone ? getCurrentDateAndTimeForTimezone(timezone) : new Date();
    const modifiers = {
        today: currentTime,
    };

    return (
        <div className='dateTime'>
            <div className='dateTime__date'>
                <span className='dateTime__input-title'>{'Date'}</span>
                <span className='dateTime__date-icon'>
                    <i
                        className='fa fa-calendar'
                        aria-hidden='true'
                    />
                </span>
                <DayPickerInput
                    value={time}
                    onDayChange={handleDayChange}
                    inputProps={{
                        readOnly: true,
                        className: 'dateTime__input',
                    }}
                    dayPickerProps={{
                        navbarElement: <Navbar/>,
                        fromMonth: currentTime,
                        modifiers,
                        locale: locale.toLowerCase(),
                        disabledDays: {
                            before: currentTime,
                        },
                    }}
                />
            </div>
            <div className='dateTime__time'>
                <MenuWrapper
                    className='dateTime__time-menu'
                >
                    <div>
                        <span className='dateTime__input-title'>{'Time'}</span>
                        <span className='dateTime__time-icon'>
                            <i
                                className='fa fa-clock-o'
                                aria-hidden='true'
                            />
                        </span>
                        <div
                            className='dateTime__input'
                        >
                            <Timestamp
                                useRelative={false}
                                useDate={false}
                                value={time}
                            />
                        </div>
                    </div>
                    <Menu
                        ariaLabel={localizeMessage('time_dropdown.choose_time', 'Choose a time')}
                        id='expiryTimeMenu'
                    >
                        <Menu.Group>
                            {Array.isArray(timeOptions) && timeOptions.map((option, index) => (
                                <Menu.ItemAction
                                    onClick={(e: React.MouseEvent) => handleTimeChange(e, option)}
                                    key={index}
                                    text={
                                        <Timestamp
                                            useRelative={false}
                                            useDate={false}
                                            value={option}
                                        />
                                    }
                                />
                            ))}
                        </Menu.Group>
                    </Menu>
                </MenuWrapper>
            </div>
        </div>
    );
};

export default DateTimeInputContainer;
