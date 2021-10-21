// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import GenericModal from 'components/generic_modal';
import QuickInput, {MaxLengthInput} from 'components/quick_input';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {createNewTask} from 'actions/time_management';

import 'components/category_modal.scss';
import './add_task_modal.scss';

type Props = {
    onHide: () => void;
    task: string;
    currentDate: Date;
};

type MenuTime = {
    minutes: number;
    text: string;
}

const timeMenuList = [
    {
        minutes: 30,
        text: '30 minutes',
    },
    {
        minutes: 60,
        text: '1 hour',
    },
    {
        minutes: 120,
        text: '2 hours',
    },
    {
        minutes: 180,
        text: '3 hours',
    },
    {
        minutes: 240,
        text: '4 hours',
    },
];

const CustomAddTaskModal: React.FC<Props> = (props: Props) => {
    const {task, currentDate} = props;
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const [text, setText] = useState<string>(task);
    const [selectedDate, setDate] = useState<Date>(currentDate);
    const [selectedTime, setTime] = useState<MenuTime>(timeMenuList[0]);

    const handleAddTask = () => {
        dispatch(createNewTask(text, selectedTime.minutes, selectedDate));
    };
    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => setText(event.target.value);
    const handleClearText = () => setText('');
    const handleSelectDay = (day: Date) => setDate(day);
    const formatDate = (date: Date): string => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return [year, month, day].join('-');
    };

    const timeMenuItems = timeMenuList.map((time) => {
        return (
            <Menu.ItemAction
                id={`task_time_dropdown_${time.text}`}
                key={time.text}
                text={time.text}
                ariaLabel={`${time.minutes} minutes`}
                onClick={() => setTime(time)}
            >
                {time.text}
            </Menu.ItemAction>
        );
    });

    return (
        <GenericModal
            enforceFocus={false}
            onHide={props.onHide}
            modalHeaderText={
                <FormattedMessage
                    id='task.modal_title'
                    defaultMessage='Add to tasks'
                />
            }
            confirmButtonText={
                <FormattedMessage
                    id='task.modal_confirm'
                    defaultMessage='Add'
                />
            }
            isConfirmDisabled={text === ''}
            id='add_task_modal'
            className='AddTaskModal'
            handleConfirm={handleAddTask}
            confirmButtonClassName='btn btn-primary'
        >
            <div className='AddTaskModal__content'>
                <div style={{marginRight: '15px'}}>
                    <div className='AddTaskModal__input'>
                        <QuickInput
                            inputComponent={MaxLengthInput}
                            value={text}
                            onClear={handleClearText}
                            className='form-control'
                            tooltipPosition='top'
                            onChange={handleTextChange}
                            placeholder={formatMessage({id: 'task.write_task', defaultMessage: 'Write your task here'})}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div>
                        <div className='Picker__input Picker__input--no-border'>
                            <div className='Picker__input__label'>
                                <FormattedMessage
                                    id='dnd_custom_time_picker_modal.date'
                                    defaultMessage='Date'
                                />
                            </div>
                            <i className='icon icon--no-spacing icon-calendar-outline icon--xs icon-14'/>
                            <DayPickerInput
                                value={formatDate(selectedDate)}
                                onDayChange={handleSelectDay}
                                dayPickerProps={{
                                    selectedDays: selectedDate,
                                    disabledDays: {
                                        before: currentDate,
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
                            className='Picker__input'
                            type='button'
                        >
                            <div className='Picker__input__label'>
                                <FormattedMessage
                                    id='task_modal.time'
                                    defaultMessage='Pick a time block'
                                />
                            </div>
                            <i className='icon icon--no-spacing icon-clock-outline icon--xs icon-14'/>
                            <span>{selectedTime.text}</span>
                        </button>
                        <Menu
                            openLeft={false}
                            ariaLabel='Time block'
                        >
                            {timeMenuItems}
                        </Menu>
                    </MenuWrapper>
                </div>
            </div>
        </GenericModal>
    );
};

export default CustomAddTaskModal;
