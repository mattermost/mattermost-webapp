// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactSelect from 'react-select';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';

import {FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';

import {localizeMessage} from 'utils/utils.jsx';

import {saveNotificationsSchedules} from 'mattermost-redux/actions/notifications_schedule';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import './notification_schedule_setting.scss';

import SettingItemMin from 'components/setting_item_min';
import SettingItemMax from 'components/setting_item_max.jsx';

import clockIcon from 'images/icons/clock-time-five.png';

const timeFormat = 'h:mm A';
const periodsOptions = [
    {value: 1, label: 'Every Day'},
    {value: 2, label: 'Weekdays'},
    {value: 3, label: 'Custom Schedule'},
];

const dispatch = store.dispatch;
const getState = store.getState;

const state = getState();
const currentUserId = getCurrentUserId(state);

class setNotificationSchedule extends React.PureComponent {
    constructor(props) {
        super(props);

        const {activeSection} = props;
        this.state = {
            activeSection,
            enableCusotmDND: false,
            selectedOption: {value: 1, label: 'Every Day'},
            monEnable: false,
            tueEnable: false,
            wedEnable: false,
            thuEnable: false,
            friEnable: false,
            satEnable: false,
            sunEnable: false,
            monStart: '09:00',
            sunStart: '09:00',
            tueStart: '09:00',
            wedStart: '09:00',
            thuStart: '09:00',
            friStart: '09:00',
            satStart: '09:00',
            sunEnd: '18:00',
            monEnd: '18:00',
            tueEnd: '18:00',
            wedEnd: '18:00',
            thuEnd: '18:00',
            friEnd: '18:00',
            satEnd: '18:00',
        };
    }
    async componentWillMount() {
        const schedules = await Client4.getScheduleStatus(currentUserId);
        if (schedules.mode > 0) {
            this.setState({
                enableCusotmDND: true,
                sunStart: schedules.sunday_start,
                monStart: schedules.monday_start,
                tueStart: schedules.tuesday_start,
                wedStart: schedules.wednesday_start,
                thuStart: schedules.thursday_start,
                friStart: schedules.friday_start,
                satStart: schedules.saturday_start,
                sunEnd: schedules.sunday_end,
                monEnd: schedules.monday_end,
                tueEnd: schedules.tuesday_end,
                wedEnd: schedules.wednesday_end,
                thuEnd: schedules.thursday_end,
                friEnd: schedules.friday_end,
                satEnd: schedules.saturday_end,
            });
            if (schedules.mode === 1) {
                this.setState({
                    selectedOption: {value: 1, label: 'Every Day'},
                });
            } else if (schedules.mode === 2) {
                this.setState({
                    selectedOption: {value: 2, label: 'Weekdays'},
                });
            } else {
                this.setState({
                    selectedOption: {value: 3, label: 'Custom Schedule'},
                });
                if (this.state.sunStart) {
                    this.setState({
                        sunEnable: true,
                    });
                }
                if (this.state.monStart) {
                    this.setState({
                        monEnable: true,
                    });
                }
                if (this.state.tueStart) {
                    this.setState({
                        tueEnable: true,
                    });
                }
                if (this.state.wedStart) {
                    this.setState({
                        wedEnable: true,
                    });
                }
                if (this.state.thuStart) {
                    this.setState({
                        thuEnable: true,
                    });
                }
                if (this.state.friStart) {
                    this.setState({
                        friEnable: true,
                    });
                }
                if (this.state.satStart) {
                    this.setState({
                        satEnable: true,
                    });
                }
            }
        }
    }

    handleSubmit = async () => {
        let nMode;
        if (this.state.enableCusotmDND === false) {
            nMode = 0;
            await this.setState({
                sunStart: '',
                monStart: '',
                tueStart: '',
                wedStart: '',
                thuStart: '',
                friStart: '',
                satStart: '',
                sunEnd: '',
                monEnd: '',
                tueEnd: '',
                wedEnd: '',
                thuEnd: '',
                friEnd: '',
                satEnd: '',
            });
        } else {
            nMode = this.state.selectedOption.value;
        }
        if (this.state.selectedOption.value === 3 && !this.state.sunEnable && !this.state.monEnable && !this.state.tueEnable && !this.state.wedEnable && !this.state.thuEnable && !this.state.friEnable && !this.state.satEnable) {
            return;
        }
        const notificationIntervalSchedule = {
            user_id: currentUserId,
            mode: nMode,
            sunday_start: this.state.sunStart,
            monday_start: this.state.monStart,
            tuesday_start: this.state.tueStart,
            wednesday_start: this.state.wedStart,
            thursday_start: this.state.thuStart,
            friday_start: this.state.friStart,
            saturday_start: this.state.satStart,
            sunday_end: this.state.sunEnd,
            monday_end: this.state.monEnd,
            tuesday_end: this.state.tueEnd,
            wednesday_end: this.state.wedEnd,
            thursday_end: this.state.thuEnd,
            friday_end: this.state.friEnd,
            saturday_end: this.state.satEnd,
        };
        this.props.updateSection('');
        dispatch(
            saveNotificationsSchedules(
                currentUserId,
                notificationIntervalSchedule,
            ),
        );
    };

    handleUpdateSection = (section) => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');
            this.props.onCancel();
        }
    };

    handelEnableChange = (e) => {
        this.setState({
            enableCusotmDND: e.target.checked,
        });
    };

    handlePeriodChange = (option) => {
        this.setState({
            selectedOption: option,
        });
        if (option.value === 1) {
            this.setState({
                sunStart: '09:00',
                monStart: '09:00',
                tueStart: '09:00',
                wedStart: '09:00',
                thuStart: '09:00',
                friStart: '09:00',
                satStart: '09:00',
                sunEnd: '18:00',
                monEnd: '18:00',
                tueEnd: '18:00',
                wedEnd: '18:00',
                thuEnd: '18:00',
                friEnd: '18:00',
                satEnd: '18:00',
            });
        } else if (option.value === 2) {
            this.setState({
                sunStart: '',
                monStart: '09:00',
                tueStart: '09:00',
                wedStart: '09:00',
                thuStart: '09:00',
                friStart: '09:00',
                satStart: '',
                sunEnd: '',
                monEnd: '18:00',
                tueEnd: '18:00',
                wedEnd: '18:00',
                thuEnd: '18:00',
                friEnd: '18:00',
                satEnd: '',
            });
        } else {
            this.setState({
                monEnable: false,
                tueEnable: false,
                wedEnable: false,
                thuEnable: false,
                friEnable: false,
                satEnable: false,
                sunEnable: false,
                sunStart: '',
                monStart: '',
                tueStart: '',
                wedStart: '',
                thuStart: '',
                friStart: '',
                satStart: '',
                sunEnd: '',
                monEnd: '',
                tueEnd: '',
                wedEnd: '',
                thuEnd: '',
                friEnd: '',
                satEnd: '',
            });
        }
    };

    handleTimeChange = (value, id) => {
        if (this.state.selectedOption.label === 'Every Day') {
            if (id === 'start') {
                this.setState({
                    monStart: value.format('kk:mm'),
                    tueStart: value.format('kk:mm'),
                    wedStart: value.format('kk:mm'),
                    thuStart: value.format('kk:mm'),
                    sunStart: value.format('kk:mm'),
                    friStart: value.format('kk:mm'),
                    satStart: value.format('kk:mm'),
                });
            } else {
                this.setState({
                    sunEnd: value.format('kk:mm'),
                    monEnd: value.format('kk:mm'),
                    tueEnd: value.format('kk:mm'),
                    wedEnd: value.format('kk:mm'),
                    thuEnd: value.format('kk:mm'),
                    friEnd: value.format('kk:mm'),
                    satEnd: value.format('kk:mm'),
                });
            }
        } else if (this.state.selectedOption.label === 'Weekdays') {
            if (id === 'start') {
                this.setState({
                    tueStart: value.format('kk:mm'),
                    wedStart: value.format('kk:mm'),
                    thuStart: value.format('kk:mm'),
                    friStart: value.format('kk:mm'),
                    monStart: value.format('kk:mm'),
                });
            } else {
                this.setState({
                    tueEnd: value.format('kk:mm'),
                    wedEnd: value.format('kk:mm'),
                    thuEnd: value.format('kk:mm'),
                    friEnd: value.format('kk:mm'),
                    monEnd: value.format('kk:mm'),
                });
            }
        } else {
            this.setState({
                [id]: value.format('kk:mm'),
            });
        }
    };

    handleDayChange = (e, start, end) => {
        this.setState({
            [e.target.id]: e.target.checked,
        });
        if (e.target.checked) {
            this.setState({
                [start]: '09:00',
                [end]: '18:00',
            });
        } else {
            this.setState({
                [start]: '',
                [end]: '',
            });
        }
    };

    renderMaxSettingView = () => {
        if (this.state.selectedOption.label === 'Custom Schedule') {
            return (
                <SettingItemMax
                    title={localizeMessage(
                        'user.settings.notifications.schedule.title',
                        'Notifications Schedule',
                    )}
                    inputs={[
                        <div key='customNotificationSchedule'>
                            <div className='mt-3'>
                                <FormattedMessage
                                    id='user.settings.notifications.scheduleInfo'
                                    defaultMessage='You can schedule when you want to receive notifications. Outside of those times, your status will be set to Do Not Disturb and notifications will be disabled.'
                                />
                            </div>
                            <div className='form-switch mt-3'>
                                <label className='switch'>
                                    <input
                                        type='checkbox'
                                        checked={this.state.enableCusotmDND}
                                        onChange={this.handelEnableChange}
                                    />
                                    <span className='slider round'/>
                                </label>
                                <FormattedMessage
                                    id='user.settings.notifications.schedule.enable'
                                    defaultMessage='Enable notifications schedule'
                                />
                            </div>
                            {this.state.enableCusotmDND ? (
                                <div className='form-select'>
                                    <FormattedMessage
                                        id='user.settings.notifications.schedule.allow'
                                        defaultMessage='Allow notifications'
                                    />
                                    <div className='mt-2'>
                                        <ReactSelect
                                            isDisabled={
                                                !this.state.enableCusotmDND
                                            }
                                            className='react-select period'
                                            classNamePrefix='react-select'
                                            id='notificationSchedule'
                                            options={periodsOptions}
                                            autosize={false}
                                            clearable={false}
                                            value={this.state.selectedOption}
                                            isSearchable={false}
                                            onChange={this.handlePeriodChange}
                                        />
                                        <div className='weekDays-selector'>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='sunEnable'
                                                checked={this.state.sunEnable}
                                                onChange={(e, start = 'sunStart', end = 'sunEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='sunEnable'>S</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='monEnable'
                                                checked={this.state.monEnable}
                                                onChange={(e, start = 'monStart', end = 'monEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='monEnable'>M</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='tueEnable'
                                                checked={this.state.tueEnable}
                                                onChange={(e, start = 'tueStart', end = 'tueEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='tueEnable'>T</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='wedEnable'
                                                checked={this.state.wedEnable}
                                                onChange={(e, start = 'wedStart', end = 'wedEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='wedEnable'>W</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='thuEnable'
                                                checked={this.state.thuEnable}
                                                onChange={(e, start = 'thuStart', end = 'thuEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='thuEnable'>T</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='friEnable'
                                                checked={this.state.friEnable}
                                                onChange={(e, start = 'friStart', end = 'friEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='friEnable'>F</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCusotmDND
                                                }
                                                type='checkbox'
                                                id='satEnable'
                                                checked={this.state.satEnable}
                                                onChange={(e, start = 'satStart', end = 'satEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='satEnable'>S</label>
                                        </div>
                                        <div className='form-time'>
                                            {this.state.sunEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Sunday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.sunStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'sunStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.sunEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'sunEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.monEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Monday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.monStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'monStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.monEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'monEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.tueEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Tuesday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.tueStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'tueStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND
                                                        }
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.tueEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'tueEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.wedEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Wednesday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.wedStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'wedStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.wedEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'wedEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.thuEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Thursday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.thuStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'thuStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.thuEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'thuEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.friEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Friday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.friStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'friStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.friEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'friEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.satEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        Saturday
                                                    </div>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.satStart, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'satStart',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                    <p>to</p>
                                                    <TimePicker
                                                        disabled={!this.state.enableCusotmDND}
                                                        className='time-picker'
                                                        showSecond={false}
                                                        format={timeFormat}
                                                        use12Hours={true}
                                                        inputReadOnly={true}
                                                        clearIcon={false}
                                                        value={moment(this.state.satEnd, 'kk:mm')}
                                                        minuteStep={30}
                                                        inputIcon={
                                                            <img
                                                                src={clockIcon}
                                                                layout='fill'
                                                            />
                                                        }
                                                        onChange={(
                                                            value,
                                                            id = 'satEnd',
                                                        ) =>
                                                            this.handleTimeChange(
                                                                value,
                                                                id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div/>
                            )}
                        </div>,
                    ]}
                    submit={this.handleSubmit}
                    saving={this.props.saving}
                    width='full'
                    updateSection={this.handleUpdateSection}
                />
            );
        }
        return (
            <SettingItemMax
                title={localizeMessage(
                    'user.settings.notifications.schedule.title',
                    'Notifications Schedule',
                )}
                inputs={[
                    <div key='NotificationSchedule'>
                        <div className='mt-3'>
                            <FormattedMessage
                                id='user.settings.notifications.scheduleInfo'
                                defaultMessage='You can schedule when you want to receive notifications. Outside of those times, your status will be set to Do Not Disturb and notifications will be disabled.'
                            />
                        </div>
                        <div className='form-switch mt-3'>
                            <label className='switch'>
                                <input
                                    type='checkbox'
                                    checked={this.state.enableCusotmDND}
                                    onChange={this.handelEnableChange}
                                />
                                <span className='slider round'/>
                            </label>
                            <FormattedMessage
                                id='user.settings.notifications.schedule.enable'
                                defaultMessage='Enable notifications schedule'
                            />
                        </div>
                        {this.state.enableCusotmDND ? (
                            <div className='form-select'>
                                <FormattedMessage
                                    id='user.settings.notifications.schedule.allow'
                                    defaultMessage='Allow notifications'
                                />
                                <div className='mt-2'>
                                    <ReactSelect
                                        isDisabled={!this.state.enableCusotmDND}
                                        className='react-select period'
                                        classNamePrefix='react-select'
                                        id='notificationSchedule'
                                        options={periodsOptions}
                                        autosize={false}
                                        clearable={false}
                                        value={this.state.selectedOption}
                                        isSearchable={false}
                                        placeholder='Period'
                                        onChange={this.handlePeriodChange}
                                    />
                                    <div className='time-wrapper n-custom-time'>
                                        <TimePicker
                                            disabled={
                                                !this.state.enableCusotmDND
                                            }
                                            className='time-picker'
                                            showSecond={false}
                                            format={timeFormat}
                                            use12Hours={true}
                                            inputReadOnly={true}
                                            clearIcon={false}
                                            onChange={(value, id = 'start') =>
                                                this.handleTimeChange(value, id)
                                            }
                                            placeholder='Start'
                                            value={moment(this.state.monStart, 'kk:mm')}
                                            minuteStep={30}
                                            inputIcon={
                                                <img
                                                    src={clockIcon}
                                                    layout='fill'
                                                />
                                            }
                                        />
                                        <p>to</p>
                                        <TimePicker
                                            disabled={
                                                !this.state.enableCusotmDND
                                            }
                                            className='time-picker'
                                            showSecond={false}
                                            format={timeFormat}
                                            use12Hours={true}
                                            inputReadOnly={true}
                                            clearIcon={false}
                                            onChange={(value, id = 'end') =>
                                                this.handleTimeChange(value, id)
                                            }
                                            placeholder='End'
                                            value={moment(this.state.monEnd, 'kk:mm')}
                                            minuteStep={30}
                                            inputIcon={
                                                <img
                                                    src={clockIcon}
                                                    layout='fill'
                                                />
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div/>
                        )}
                    </div>,
                ]}
                submit={this.handleSubmit}
                saving={this.props.saving}
                server_error={this.props.serverError}
                width='full'
                updateSection={this.handleUpdateSection}
            />
        );
    };

    renderMinSettingView = () => {
        let description;
        if (!this.state.enableCusotmDND) {
            description = (
                <FormattedMessage
                    id='user.settings.notifications.schedule.time.disabled'
                    defaultMessage='Disabled'
                />
            );
        } else if (this.state.selectedOption.value === 1) {
            description = (
                <FormattedMessage
                    id='user.settings.notifications.schedule.time.everyday'
                    defaultMessage='Every Day'
                />
            );
        } else if (this.state.selectedOption.value === 2) {
            description = (
                <FormattedMessage
                    id='user.settings.notifications.schedule.time.weekdays'
                    defaultMessage='Weekdays'
                />
            );
        } else {
            description = (
                <FormattedMessage
                    id='user.settings.notifications.schedule.time.custom'
                    defaultMessage='Custom Schedule'
                />
            );
        }
        return (
            <SettingItemMin
                title={localizeMessage(
                    'user.settings.notifications.schedule.title',
                    'Notifications Schedule',
                )}
                describe={description}
                section={'schedule'}
                updateSection={this.handleUpdateSection}
            />
        );
    };

    render() {
        if (this.props.activeSection !== 'schedule') {
            return this.renderMinSettingView();
        }

        return this.renderMaxSettingView();
    }
}

export default setNotificationSchedule;
