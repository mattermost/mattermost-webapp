// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import classNames from 'classnames';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserStatus} from '@mattermost/types/users';

import GenericModal from 'components/generic_modal';

import {UserStatuses} from 'utils/constants';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './dnd_custom_time_picker_modal.scss';
import {toUTCUnix} from 'utils/datetime';
import {localizeMessage} from 'utils/utils';
import Input from 'components/widgets/inputs/input/input';
import DatePicker from 'components/date_picker';

type Props = {
    onExited: () => void;
    userId: string;
    currentDate: Date;
    locale: string;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
};

type State = {
    selectedDate: Date;
    selectedTime: string;
    timeMenuList: string[];
    dayPickerStartDate: Date;
    isPopperOpen: boolean;
    popperElement: HTMLDivElement | null;
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
            isPopperOpen: false,
            popperElement: null,
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

    handleConfirm = async () => {
        if (this.state.isPopperOpen) {
            return;
        }
        const hours = parseInt(this.state.selectedTime.split(':')[0], 10);
        const minutes = parseInt(this.state.selectedTime.split(':')[1], 10);
        const endTime = new Date(this.state.selectedDate);
        endTime.setHours(hours, minutes);
        if (endTime < new Date()) {
            return;
        }
        await this.props.actions.setStatus({
            user_id: this.props.userId,
            status: UserStatuses.DND,
            dnd_end_time: toUTCUnix(endTime),
            manual: true,
            last_activity_at: toUTCUnix(this.props.currentDate),
        });
        this.props.onExited();
    }

    handleDaySelection = (day: Date) => {
        this.setState({
            isPopperOpen: false,
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

    handlePopperOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            isPopperOpen: true,
        });
    };

    handlePopperClosed = () => {
        this.setState({
            isPopperOpen: false,
        });
    };

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        const {timeMenuList, selectedTime, selectedDate, dayPickerStartDate, isPopperOpen} = this.state;
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
                ariaLabel={localizeMessage('dnd_custom_time_picker_modal.defaultMsg', 'Disable notifications until')}
                onExited={this.props.onExited}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                handleConfirm={this.handleConfirm}
                handleEnterKeyPress={this.handleConfirm}
                id='dndCustomTimePickerModal'
                className={'DndModal modal-overflow'}
                tabIndex={-1}
            >
                <div className='DndModal__content'>
                    <DatePicker
                        isPopperOpen={isPopperOpen}
                        closePopper={this.handlePopperClosed}
                        locale={this.props.locale}
                        datePickerProps={{
                            initialFocus: isPopperOpen,
                            mode: 'single',
                            selected: selectedDate,
                            onDayClick: this.handleDaySelection,
                            disabled: [{
                                before: dayPickerStartDate,
                            }],
                            showOutsideDays: true,
                        }}
                    >
                        <Input
                            value={this.formatDate(selectedDate)}
                            readOnly={true}
                            id='DndModal__calendar-input'
                            className={classNames('DndModal__calendar-input', {'popper-open': isPopperOpen})}
                            label={localizeMessage('dnd_custom_time_picker_modal.date', 'Date')}
                            onClick={this.handlePopperOpen}
                            tabIndex={-1}
                            inputPrefix={
                                <IconButton
                                    icon={'calendar-outline'}
                                    onClick={this.handlePopperOpen}
                                    size={'sm'}
                                />
                            }
                        />
                    </DatePicker>
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
            </GenericModal>
        );
    }
}
