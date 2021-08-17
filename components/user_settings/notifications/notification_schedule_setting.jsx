// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import 'rc-time-picker/assets/index.css';

import {FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';

import {localizeMessage} from 'utils/utils.jsx';

import {saveNotificationsSchedules} from 'mattermost-redux/actions/notifications_schedule';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import './notification_schedule_setting.scss';

import SettingItemMin from 'components/setting_item_min';
import SettingItemMax from 'components/setting_item_max.jsx';

const periodsOptions = [
    {value: 1, label: 'Every Day'},
    {value: 2, label: 'Weekdays'},
    {value: 3, label: 'Custom Schedule'},
];
const dateOptions = [
    {value: '09:00', label: '09:00'},
    {value: '09:30', label: '09:30'},
    {value: '10:00', label: '10:00'},
    {value: '10:30', label: '10:30'},
    {value: '11:00', label: '11:00'},
    {value: '11:30', label: '11:30'},
    {value: '12:00', label: '12:00'},
    {value: '12:30', label: '12:30'},
    {value: '13:00', label: '13:00'},
    {value: '13:30', label: '13:30'},
    {value: '14:00', label: '14:00'},
    {value: '14:30', label: '14:30'},
    {value: '15:00', label: '15:00'},
    {value: '15:30', label: '15:30'},
    {value: '16:00', label: '16:00'},
    {value: '16:30', label: '16:30'},
    {value: '17:00', label: '17:00'},
    {value: '17:30', label: '17:30'},
    {value: '18:00', label: '18:00'},
    {value: '18:30', label: '18:30'},
    {value: '19:00', label: '19:00'},
    {value: '19:30', label: '19:30'},
    {value: '20:00', label: '20:00'},
    {value: '20:30', label: '20:30'},
    {value: '21:00', label: '21:00'},
    {value: '21:30', label: '21:30'},
    {value: '22:00', label: '22:00'},
    {value: '22:30', label: '22:30'},
    {value: '23:00', label: '23:00'},
    {value: '23:30', label: '23:30'},
    {value: '24:00', label: '24:00'},
    {value: '24:30', label: '24:30'},
    {value: '01:00', label: '01:00'},
    {value: '01:30', label: '01:30'},
    {value: '02:00', label: '02:00'},
    {value: '02:30', label: '02:30'},
    {value: '03:00', label: '03:00'},
    {value: '03:30', label: '03:30'},
    {value: '04:00', label: '04:00'},
    {value: '04:30', label: '04:30'},
    {value: '05:00', label: '05:00'},
    {value: '05:30', label: '05:30'},
    {value: '06:00', label: '06:00'},
    {value: '06:30', label: '06:30'},
    {value: '07:00', label: '07:00'},
    {value: '07:30', label: '07:30'},
    {value: '08:00', label: '08:00'},
    {value: '08:30', label: '08:30'},
];

const dispatch = store.dispatch;
const getState = store.getState;

const state = getState();
const currentUserId = getCurrentUserId(state);

class setNotificationSchedule extends React.PureComponent {
    static propTypes = {
        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        saving: PropTypes.bool,
        onCancel: PropTypes.func,
        serverError: PropTypes.func,
    };
    constructor(props) {
        super(props);

        const {activeSection} = props;
        this.state = {
            activeSection,
            enableCustomDND: false,
            selectedOption: {value: 1, label: 'Every Day'},
            monEnable: false,
            tueEnable: false,
            wedEnable: false,
            thuEnable: false,
            friEnable: false,
            satEnable: false,
            sunEnable: false,
            sunStart: {value: '09:00', label: '09:00'},
            tueStart: {value: '09:00', label: '09:00'},
            monStart: {value: '09:00', label: '09:00'},
            wedStart: {value: '09:00', label: '09:00'},
            thuStart: {value: '09:00', label: '09:00'},
            friStart: {value: '09:00', label: '09:00'},
            satStart: {value: '09:00', label: '09:00'},
            sunEnd: {value: '18:00', label: '18:00'},
            monEnd: {value: '18:00', label: '18:00'},
            tueEnd: {value: '18:00', label: '18:00'},
            wedEnd: {value: '18:00', label: '18:00'},
            thuEnd: {value: '18:00', label: '18:00'},
            friEnd: {value: '18:00', label: '18:00'},
            satEnd: {value: '18:00', label: '18:00'},
        };
    }
    async componentWillMount() {
        const schedules = await Client4.getScheduleStatus(currentUserId);
        if (schedules.mode > 0) {
            this.setState({
                enableCustomDND: true,
                sunStart: {value: schedules.sunday_start, label: schedules.sunday_start},
                monStart: {value: schedules.monday_start, label: schedules.monday_start},
                tueStart: {value: schedules.tuesday_start, label: schedules.tuesday_start},
                wedStart: {value: schedules.wednesday_start, label: schedules.wednesday_start},
                thuStart: {value: schedules.thursday_start, label: schedules.thursday_start},
                friStart: {value: schedules.friday_start, label: schedules.friday_start},
                satStart: {value: schedules.saturday_start, label: schedules.saturday_start},
                sunEnd: {value: schedules.sunday_end, label: schedules.sunday_end},
                monEnd: {value: schedules.monday_end, label: schedules.monday_end},
                tueEnd: {value: schedules.tuesday_end, label: schedules.tuesday_end},
                wedEnd: {value: schedules.wednesday_end, label: schedules.wednesday_end},
                thuEnd: {value: schedules.thursday_end, label: schedules.thursday_end},
                friEnd: {value: schedules.friday_end, label: schedules.friday_end},
                satEnd: {value: schedules.saturday_end, label: schedules.saturday_end},
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
                if (schedules.sunday_start) {
                    this.setState({
                        sunEnable: true,
                    });
                }
                if (schedules.monday_start) {
                    this.setState({
                        monEnable: true,
                    });
                }
                if (schedules.tuesday_start) {
                    this.setState({
                        tueEnable: true,
                    });
                }
                if (schedules.wednesday_start) {
                    this.setState({
                        wedEnable: true,
                    });
                }
                if (schedules.thursday_start) {
                    this.setState({
                        thuEnable: true,
                    });
                }
                if (schedules.friday_start) {
                    this.setState({
                        friEnable: true,
                    });
                }
                if (schedules.saturday_start) {
                    this.setState({
                        satEnable: true,
                    });
                }
            }
        }
    }

    handleSubmit = async () => {
        let nMode;
        if (this.state.enableCustomDND === false) {
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
            sunday_start: this.state.sunStart.value,
            monday_start: this.state.monStart.value,
            tuesday_start: this.state.tueStart.value,
            wednesday_start: this.state.wedStart.value,
            thursday_start: this.state.thuStart.value,
            friday_start: this.state.friStart.value,
            saturday_start: this.state.satStart.value,
            sunday_end: this.state.sunEnd.value,
            monday_end: this.state.monEnd.value,
            tuesday_end: this.state.tueEnd.value,
            wednesday_end: this.state.wedEnd.value,
            thursday_end: this.state.thuEnd.value,
            friday_end: this.state.friEnd.value,
            saturday_end: this.state.satEnd.value,
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
            enableCustomDND: e.target.checked,
        });
        if (e.target.checked) {
            this.setState({
                selectedOption: {value: 1, label: 'Every Day'},
                sunStart: {value: '09:00', label: '09:00'},
                tueStart: {value: '09:00', label: '09:00'},
                monStart: {value: '09:00', label: '09:00'},
                wedStart: {value: '09:00', label: '09:00'},
                thuStart: {value: '09:00', label: '09:00'},
                friStart: {value: '09:00', label: '09:00'},
                satStart: {value: '09:00', label: '09:00'},
                sunEnd: {value: '18:00', label: '18:00'},
                monEnd: {value: '18:00', label: '18:00'},
                tueEnd: {value: '18:00', label: '18:00'},
                wedEnd: {value: '18:00', label: '18:00'},
                thuEnd: {value: '18:00', label: '18:00'},
                friEnd: {value: '18:00', label: '18:00'},
                satEnd: {value: '18:00', label: '18:00'},
            });
        }
    };

    handlePeriodChange = (option) => {
        this.setState({
            selectedOption: option,
        });
        if (option.value === 1) {
            this.setState({
                sunStart: {value: '09:00', label: '09:00'},
                monStart: {value: '09:00', label: '09:00'},
                tueStart: {value: '09:00', label: '09:00'},
                wedStart: {value: '09:00', label: '09:00'},
                thuStart: {value: '09:00', label: '09:00'},
                friStart: {value: '09:00', label: '09:00'},
                satStart: {value: '09:00', label: '09:00'},
                sunEnd: {value: '18:00', label: '18:00'},
                monEnd: {value: '18:00', label: '18:00'},
                tueEnd: {value: '18:00', label: '18:00'},
                wedEnd: {value: '18:00', label: '18:00'},
                thuEnd: {value: '18:00', label: '18:00'},
                friEnd: {value: '18:00', label: '18:00'},
                satEnd: {value: '18:00', label: '18:00'},
            });
        } else if (option.value === 2) {
            this.setState({
                sunStart: '',
                monStart: {value: '09:00', label: '09:00'},
                tueStart: {value: '09:00', label: '09:00'},
                wedStart: {value: '09:00', label: '09:00'},
                thuStart: {value: '09:00', label: '09:00'},
                friStart: {value: '09:00', label: '09:00'},
                satStart: '',
                sunEnd: '',
                monEnd: {value: '18:00', label: '18:00'},
                tueEnd: {value: '18:00', label: '18:00'},
                wedEnd: {value: '18:00', label: '18:00'},
                thuEnd: {value: '18:00', label: '18:00'},
                friEnd: {value: '18:00', label: '18:00'},
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

    handleTimeChange = (option, target) => {
        if (this.state.selectedOption.label === 'Every Day') {
            if (target === 'start') {
                this.setState({
                    monStart: option,
                    tueStart: option,
                    wedStart: option,
                    thuStart: option,
                    sunStart: option,
                    friStart: option,
                    satStart: option,
                });
            } else {
                this.setState({
                    sunEnd: option,
                    monEnd: option,
                    tueEnd: option,
                    wedEnd: option,
                    thuEnd: option,
                    friEnd: option,
                    satEnd: option,
                });
            }
        } else if (this.state.selectedOption.label === 'Weekdays') {
            if (target === 'start') {
                this.setState({
                    tueStart: option,
                    wedStart: option,
                    thuStart: option,
                    friStart: option,
                    monStart: option,
                });
            } else {
                this.setState({
                    tueEnd: option,
                    wedEnd: option,
                    thuEnd: option,
                    friEnd: option,
                    monEnd: option,
                });
            }
        } else {
            this.setState({
                [target]: option,
            });
        }
    };

    handleDayChange = (e, start, end) => {
        this.setState({
            [e.target.id]: e.target.checked,
        });
        if (e.target.checked) {
            this.setState({
                [start]: {value: '09:00', label: '09:00'},
                [end]: {value: '18:00', label: '18:00'},
            });
        } else {
            this.setState({
                [start]: '',
                [end]: '',
            });
        }
    };

    renderMaxSettingView = () => {
        const to = 'to';
        if (this.state.selectedOption.label === 'Custom Schedule') {
            const weekInfo = [
                {
                    label: 'S',
                    name: 'Sunday',
                },
                {
                    label: 'M',
                    name: 'Monday',
                },
                {
                    label: 'T',
                    name: 'Tuesday',
                },
                {
                    label: 'W',
                    name: 'Wednesday',
                },
                {
                    label: 'T',
                    name: 'Thursday',
                },
                {
                    label: 'F',
                    name: 'Friday',
                },
                {
                    label: 'S',
                    name: 'Saturday',
                },
            ];
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
                                        checked={this.state.enableCustomDND}
                                        onChange={this.handelEnableChange}
                                    />
                                    <span className='slider round'/>
                                </label>
                                <FormattedMessage
                                    id='user.settings.notifications.schedule.enable'
                                    defaultMessage='Enable notifications schedule'
                                />
                            </div>
                            {this.state.enableCustomDND ? (
                                <div className='form-select'>
                                    <FormattedMessage
                                        id='user.settings.notifications.schedule.allow'
                                        defaultMessage='Allow notifications'
                                    />
                                    <div className='mt-2'>
                                        <ReactSelect
                                            isDisabled={
                                                !this.state.enableCustomDND
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
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='sunEnable'
                                                checked={this.state.sunEnable}
                                                onChange={(e, start = 'sunStart', end = 'sunEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='sunEnable'>{weekInfo[0].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='monEnable'
                                                checked={this.state.monEnable}
                                                onChange={(e, start = 'monStart', end = 'monEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='monEnable'>{weekInfo[1].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='tueEnable'
                                                checked={this.state.tueEnable}
                                                onChange={(e, start = 'tueStart', end = 'tueEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='tueEnable'>{weekInfo[2].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='wedEnable'
                                                checked={this.state.wedEnable}
                                                onChange={(e, start = 'wedStart', end = 'wedEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='wedEnable'>{weekInfo[3].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='thuEnable'
                                                checked={this.state.thuEnable}
                                                onChange={(e, start = 'thuStart', end = 'thuEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='thuEnable'>{weekInfo[4].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='friEnable'
                                                checked={this.state.friEnable}
                                                onChange={(e, start = 'friStart', end = 'friEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='friEnable'>{weekInfo[5].label}</label>
                                            <input
                                                disabled={
                                                    !this.state.enableCustomDND
                                                }
                                                type='checkbox'
                                                id='satEnable'
                                                checked={this.state.satEnable}
                                                onChange={(e, start = 'satStart', end = 'satEnd') =>
                                                    this.handleDayChange(e, start, end)
                                                }
                                                className='weekday'
                                            />
                                            <label htmlFor='satEnable'>{weekInfo[6].label}</label>
                                        </div>
                                        <div className='form-time'>
                                            {this.state.sunEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[0].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.sunStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'sunStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.sunEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'sunEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.monEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[1].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.monStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'start')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.monEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'monEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.tueEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[2].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.tueStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'tueStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.tueEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'tueEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.wedEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[3].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.wedStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'wedStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.wedEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'wedEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.thuEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[4].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.thuStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'thuStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.thuEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'thuEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.friEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[5].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.friStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'friStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.friEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'friEnd')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div/>
                                            )}
                                            {this.state.satEnable ? (
                                                <div className='time-wrapper custom-time'>
                                                    <div className='week-name'>
                                                        {weekInfo[6].name}
                                                    </div>
                                                    <div className='left-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.satStart}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'satStart')
                                                            }
                                                        />
                                                    </div>
                                                    <p>{to}</p>
                                                    <div className='right-wrapper'>
                                                        <span className='time-icon'>
                                                            <i className='icon-clock-outline'/>
                                                        </span>
                                                        <ReactSelect
                                                            isDisabled={!this.state.enableCustomDND}
                                                            components={{
                                                                IndicatorSeparator: () => null,
                                                                DropdownIndicator: () => null,
                                                            }}
                                                            className='react-select time'
                                                            classNamePrefix='react-select'
                                                            options={dateOptions}
                                                            id='start'
                                                            autosize={false}
                                                            clearable={false}
                                                            value={this.state.satEnd}
                                                            isSearchable={false}
                                                            onChange={(option) =>
                                                                this.handleTimeChange(option, 'satEnd')
                                                            }
                                                        />
                                                    </div>
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
                                    checked={this.state.enableCustomDND}
                                    onChange={this.handelEnableChange}
                                />
                                <span className='slider round'/>
                            </label>
                            <FormattedMessage
                                id='user.settings.notifications.schedule.enable'
                                defaultMessage='Enable notifications schedule'
                            />
                        </div>
                        {this.state.enableCustomDND ? (
                            <div className='form-select'>
                                <FormattedMessage
                                    id='user.settings.notifications.schedule.allow'
                                    defaultMessage='Allow notifications'
                                />
                                <div className='mt-2'>
                                    <ReactSelect
                                        isDisabled={!this.state.enableCustomDND}
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
                                        <div className='left-wrapper'>
                                            <span className='time-icon'>
                                                <i className='icon-clock-outline'/>
                                            </span>
                                            <ReactSelect
                                                isDisabled={!this.state.enableCustomDND}
                                                components={{
                                                    IndicatorSeparator: () => null,
                                                    DropdownIndicator: () => null,
                                                }}
                                                className='react-select time'
                                                classNamePrefix='react-select'
                                                options={dateOptions}
                                                id='start'
                                                autosize={false}
                                                clearable={false}
                                                value={this.state.monStart}
                                                isSearchable={false}
                                                onChange={(option) =>
                                                    this.handleTimeChange(option, 'start')
                                                }
                                            />
                                        </div>
                                        <p>{to}</p>
                                        <div className='right-wrapper'>
                                            <span className='time-icon'>
                                                <i className='icon-clock-outline'/>
                                            </span>
                                            <ReactSelect
                                                isDisabled={!this.state.enableCustomDND}
                                                components={{
                                                    IndicatorSeparator: () => null,
                                                    DropdownIndicator: () => null,
                                                }}
                                                className='react-select time'
                                                classNamePrefix='react-select'
                                                options={dateOptions}
                                                id='end'
                                                autosize={false}
                                                clearable={false}
                                                value={this.state.monEnd}
                                                isSearchable={false}
                                                onChange={(option) =>
                                                    this.handleTimeChange(option, 'end')
                                                }
                                            />
                                        </div>
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
        if (!this.state.enableCustomDND) {
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
