// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import GenericModal from 'components/generic_modal';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './post_reminder_custom_time_picker_modal.scss';
import {toUTCUnix} from 'utils/datetime';
import {localizeMessage} from 'utils/utils';

type Props = {
    onExited: () => void;
    userId: string;
    postId: string;
    currentDate: Date;
    isMilitaryTime: boolean;
    actions: {
        addPostReminder: (postId: string, userId: string, timestamp: number) => void;
    };
};

type State = {
    selectedDate: Date;
    selectedTime: string;
    timeMenuList: string[];
    dayPickerStartDate: Date;
}

export default class PostReminderCustomTimePicker extends React.PureComponent<Props, State> {
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
                id='post_reminder.custom_time_picker_modal.header'
                defaultMessage='Set a reminder'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='post_reminder.custom_time_picker_modal.submit_button'
                defaultMessage='Set reminder'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    handleConfirm = () => {
        let hours;
        let minutes;
        if (this.props.isMilitaryTime) {
            hours = parseInt(this.state.selectedTime.split(':')[0], 10);
            minutes = parseInt(this.state.selectedTime.split(':')[1], 10);
        } else {
            hours = parseInt(this.state.selectedTime.split(':')[0], 10);
            const suffix = this.state.selectedTime.split(':')[1];
            minutes = parseInt(suffix.split(' ')[0], 10);
            const ampm = suffix.split(' ')[1];
            hours = ampm === 'AM' ? hours : hours + 12;
        }
        const endTime = new Date(this.state.selectedDate);
        endTime.setHours(hours, minutes);
        if (endTime < new Date()) {
            return;
        }
        this.props.actions.addPostReminder(this.props.userId, this.props.postId, toUTCUnix(endTime));
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
                let t;
                if (this.props.isMilitaryTime) {
                    t = i.toString().padStart(2, '0') + ':' + (j * 30).toString().padStart(2, '0');
                } else {
                    const ampm = i >= 12 ? ' PM' : ' AM';
                    const hour = i > 12 ? i - 12 : i;
                    t = hour.toString() + ':' + (j * 30).toString().padStart(2, '0') + ampm;
                }
                timeMenuItems.push(
                    t,
                );
            }
            m = 0;
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
                    id={`postReminderTime_dropdown_${time}`}
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
                ariaLabel={localizeMessage('post_reminder_custom_time_picker_modal.defaultMsg', 'Set a reminder')}
                onExited={this.props.onExited}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                handleConfirm={this.handleConfirm}
                handleEnterKeyPress={this.handleConfirm}
                id='PostReminderCustomTimePickerModal'
                className={'PostReminderModal modal-overflow'}
            >
                <div className='PostReminderModal__content'>
                    <div>
                        <div className='PostReminderModal__input PostReminderModal__input--no-border'>
                            <div className='PostReminderModal__input__label'>
                                <FormattedMessage
                                    id='post_reminder_custom_time_picker_modal.date'
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
                            className='PostReminderModal__input'
                            type='button'
                        >
                            <div className='PostReminderModal__input__label'>
                                <FormattedMessage
                                    id='post_reminder_custom_time_picker_modal.time'
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
            </GenericModal>
        );
    }
}
