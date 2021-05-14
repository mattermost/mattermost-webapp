// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {DayModifiers, NavbarElementProps} from 'react-day-picker';

import moment, {Moment} from 'moment-timezone';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import Timestamp from 'components/timestamp';
import {getCurrentLocale} from 'selectors/i18n';
import {Constants} from 'utils/constants';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import {localizeMessage} from 'utils/utils';

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
export function getRoundedTime(value: Moment) {
    const roundedTo = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    const start = moment(value);
    const diff = start.minute() % roundedTo;
    if (diff === 0) {
        return value;
    }
    const remainder = roundedTo - diff;
    return start.add(remainder, 'm').seconds(0).milliseconds(0);
}

const getTimeInIntervals = (startTime: Moment): Date[] => {
    const interval = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    let time = moment(startTime);
    const nextDay = moment(startTime).add(1, 'days').startOf('day');
    const intervals: Date[] = [];
    while (time.isBefore(nextDay)) {
        intervals.push(time.toDate());
        time = time.add(interval, 'minutes').seconds(0).milliseconds(0);
    }

    return intervals;
};

type Props = {
    time: Moment;
    handleChange: (date: Moment) => void;
    timezone?: string;
}

const DateTimeInputContainer: React.FC<Props> = (props: Props) => {
    const locale = useSelector(getCurrentLocale);
    const {time, handleChange, timezone} = props;
    const [timeOptions, setTimeOptions] = useState<Date[]>([]);

    const setTimeAndOptions = () => {
        const currentTime = getCurrentMomentForTimezone(timezone);
        let startTime = moment(time).startOf('day');
        if (time.date() === currentTime.date()) {
            startTime = getRoundedTime(currentTime);
        }
        setTimeOptions(getTimeInIntervals(startTime));
    };

    useEffect(setTimeAndOptions, [time]);

    const handleDayChange = (day: Date, modifiers: DayModifiers) => {
        if (modifiers.today) {
            const currentTime = getCurrentMomentForTimezone(timezone);
            const roundedTime = getRoundedTime(currentTime);
            handleChange(roundedTime);
        } else {
            const dayWithTimezone = timezone ? moment.tz(day, timezone) : moment();
            handleChange(dayWithTimezone.startOf('day'));
        }
    };

    const handleTimeChange = (e: React.MouseEvent, time: Date) => {
        e.preventDefault();
        handleChange(moment(time));
    };

    const currentTime = new Date();
    const modifiers = {
        today: currentTime,
    };

    return (
        <div className='dateTime'>
            <div className='dateTime__date'>
                <span className='dateTime__input-title'>{'Date'}</span>
                <span className='dateTime__date-icon'>
                    <i className='icon-calendar-outline'/>
                </span>
                <DayPickerInput
                    value={time.toDate()}
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
                            <i className='icon-clock-outline'/>
                        </span>
                        <div
                            className='dateTime__input'
                        >
                            <Timestamp
                                useRelative={false}
                                useDate={false}
                                value={time.toString()}
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
