// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserStatus} from 'mattermost-redux/types/users';

import GenericModal from 'components/generic_modal';

import {UserStatuses} from 'utils/constants';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './dnd_custom_time_picker_modal.scss';
import {toUTCUnix} from 'utils/datetime';

type Props = {
    onHide: () => void;
    userId: string;
    currentDate: Date;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
};

type State = {
    selectedDate: Date;
    selectedTime: string;
    timeMenuList: string[];
    dayPickerStartDate: Date;
}

export default class DndCustomTimePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {currentDate} = this.props;
        const selectedDate: Date = new Date(currentDate);

        // if current time is > 23:20 then we will set date to tomorrow and show all times
        if (currentDate.getHours() === 23 && currentDate.getMinutes() > 20) {
            selectedDate.setDate(currentDate.getDate() + 1);
        }

        this.state = {
            selectedDate,
            dayPickerStartDate: selectedDate,
            ...this.makeTimeMenuList(selectedDate),
        };
    }

    formatDate = (date: Date): string => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return [year, month, day].join('-');
    }

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.defaultMsg'
                defaultMessage='Disable notifications until'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.submitButton'
                defaultMessage='Disable Notifications'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    handleConfirm = (event: any) => {
        event.preventDefault();
        const hours = parseInt(this.state.selectedTime.split(':')[0], 10);
        const minutes = parseInt(this.state.selectedTime.split(':')[1], 10);
        const endTime = new Date(this.state.selectedDate);
        endTime.setHours(hours, minutes);
        if (endTime < new Date()) {
            return;
        }
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status: UserStatuses.DND,
            dnd_end_time: toUTCUnix(endTime),
            manual: true,
            last_activity_at: toUTCUnix(this.props.currentDate),
        });
        this.props.onHide();
    }

    handleDaySelection = (day: Date) => {
        this.setState({
            selectedDate: day,
            ...this.makeTimeMenuList(day),
        });
    };

    makeTimeMenuList = (date: Date): {timeMenuList: string[]; selectedTime: string} => {
        const timeMenuItems = [];
        let h = 0;
        let m = 0;
        const curr = this.props.currentDate;

        if (this.formatDate(curr) === this.formatDate(date)) {
            h = curr.getHours();
            m = curr.getMinutes();
            if (m > 20) {
                h++;
                m = 0;
            } else {
                m = 30;
            }
        }

        for (let i = h; i < 24; i++) {
            for (let j = m / 30; j < 2; j++) {
                const t = i.toString().padStart(2, '0') + ':' + (j * 30).toString().padStart(2, '0');
                timeMenuItems.push(
                    t,
                );
            }
        }

        return {
            timeMenuList: timeMenuItems,
            selectedTime: timeMenuItems[0],
        };
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        const {timeMenuList, selectedTime, selectedDate, dayPickerStartDate} = this.state;
        const timeMenuItems = timeMenuList.map((time) => {
            return (
                <Menu.ItemAction
                    id={`dndTime_dropdown_${time}`}
                    key={time}
                    text={time}
                    ariaLabel={`${time} hours`}
                    onClick={() => {
                        this.setState({
                            selectedTime: time,
                        });
                    }}
                >
                    {time}
                </Menu.ItemAction>
            );
        });

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                id='dndCustomTimePickerModal'
                className={'DndModal modal-overflow'}
            >
                <div className='DndModal__content'>
                    <div>
                        <div className='DndModal__input DndModal__input--no-border'>
                            <div className='DndModal__input__label'>
                                <FormattedMessage
                                    id='dnd_custom_time_picker_modal.date'
                                    defaultMessage='Date'
                                />
                            </div>
                            <i className='icon icon--no-spacing icon-calendar-outline icon--xs icon-14'/>
                            <DayPickerInput
                                value={this.formatDate(selectedDate)}
                                onDayChange={this.handleDaySelection}
                                dayPickerProps={{
                                    selectedDays: selectedDate,
                                    disabledDays: {
                                        before: dayPickerStartDate,
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <MenuWrapper
                        id='dropdown-no-caret'
                        stopPropagationOnToggle={true}
                    >
                        <button
                            className='DndModal__input'
                            type='button'
                        >
                            <div className='DndModal__input__label'>
                                <FormattedMessage
                                    id='dnd_custom_time_picker_modal.time'
                                    defaultMessage='Time'
                                />
                            </div>
                            <i className='icon icon--no-spacing icon-clock-outline icon--xs icon-14'/>
                            <span>{selectedTime}</span>
                        </button>
                        <Menu
                            openLeft={false}
                            ariaLabel={'Clear custom status after'}
                        >
                            {timeMenuItems}
                        </Menu>
                    </MenuWrapper>
                </div>
                <div className='DndModal__footer'>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.handleConfirm}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </GenericModal>
        );
    }
}
