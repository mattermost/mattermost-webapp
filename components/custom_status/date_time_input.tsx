// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {DayModifiers, NavbarElementProps} from 'react-day-picker';

import {localizeMessage} from 'utils/utils';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentLocale} from 'selectors/i18n';
import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getCurrentDateForTimezone} from 'utils/timezone';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {CustomStatusExpiryConstants} from 'utils/constants';

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

const DateTimeInputContainer: React.FC = () => {
    const [day, setDay] = useState(CustomStatusExpiryConstants.TODAY);
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
            setDay(CustomStatusExpiryConstants.TODAY);
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
                        <input
                            value='12:30 PM'
                            readOnly={true}
                        />
                    </div>
                    <Menu
                        ariaLabel={localizeMessage('time_dropdown.choose_time', 'Choose a time')}
                        id='expiryTimeMenu'
                    >
                        <Menu.Group>
                            <Menu.ItemAction
                                text='12:30 PM'
                                id={'expiry-time-menu-1230'}
                            />
                        </Menu.Group>
                    </Menu>
                </MenuWrapper>
            </div>
        </div>
    );
};

export default DateTimeInputContainer;
