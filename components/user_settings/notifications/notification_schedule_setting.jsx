import React from 'react';
import ReactSelect from 'react-select';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';
import store from 'stores/redux_store.jsx';

import { localizeMessage } from 'utils/utils.jsx';
import { FormattedMessage } from 'react-intl';
import { saveNotificationsSchedules } from 'mattermost-redux/actions/notifications_schedule';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import './notification_schedule_setting.scss'

import SettingItemMin from 'components/setting_item_min';
import SettingItemMax from 'components/setting_item_max.jsx';

import clockIcon from 'images/icons/clock-time-five.png';

const timeFormat = 'h:mm A'
const dispatch = store.dispatch;
const getState = store.getState;

class set_notification_schedule extends React.PureComponent {
  constructor(props) {
    super(props);

    const {
        activeSection,
    } = props;


    this.state = {
      activeSection,
      enableCusotmDND: false,
      selectedOption: { value: 1, label: 'Every Day'},
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
    };
  }

  handleSubmit = async () => {
    const state = getState();
    const currentUserId = getCurrentUserId(state);
    this.props.updateSection('');
    const notificationIntervalSchedule = {
      user_id : currentUserId,
      mode: this.state.selectedOption.value,
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
    }
    dispatch(saveNotificationsSchedules(currentUserId, notificationIntervalSchedule));
  }

  handleUpdateSection = (section) => {
    if (section) {
        this.props.updateSection(section);
    } else {
      this.props.updateSection('');
      this.props.onCancel();
    }
  }

  handelEnableChange = (e) => {
    this.setState({
        enableCusotmDND: e.target.checked,
    });
  }

  handlePeriodChange = (option) => {
    this.setState({
      selectedOption: option
    })
  }

  handleTimeChange = (value, id) => {
    if (this.state.selectedOption.label === 'Every Day') {
      if (id === 'start') {
        this.setState({
          sunStart: value.format('kk:mm'),
          monStart: value.format('kk:mm'),
          tueStart: value.format('kk:mm'),
          wedStart: value.format('kk:mm'),
          thuStart: value.format('kk:mm'),
          friStart: value.format('kk:mm'),
          satStart: value.format('kk:mm'),
        })
      } else {
        this.setState({
          sunEnd: value.format('kk:mm'),
          monEnd: value.format('kk:mm'),
          tueEnd: value.format('kk:mm'),
          wedEnd: value.format('kk:mm'),
          thuEnd: value.format('kk:mm'),
          friEnd: value.format('kk:mm'),
          satEnd: value.format('kk:mm'),
        })
      }
    } else if (this.state.selectedOption.label === 'Weekdays') {
      if (id === 'start') {
        this.setState({
          monStart: value.format('kk:mm'),
          tueStart: value.format('kk:mm'),
          wedStart: value.format('kk:mm'),
          thuStart: value.format('kk:mm'),
          friStart: value.format('kk:mm'),      
        })
      } else {
        this.setState({
          monEnd: value.format('kk:mm'),
          tueEnd: value.format('kk:mm'),
          wedEnd: value.format('kk:mm'),
          thuEnd: value.format('kk:mm'),
          friEnd: value.format('kk:mm'),
        })
      }
    } else {
      this.setState({
        [id]: value.format('kk:mm'),
      })
    }
  }

  handleWeekChange = (e) => {
    this.setState({
      [e.target.id]: e.target.checked
    })
  }


  renderMaxSettingView = () => {
    const options = [
      { value: 1, label: 'Every Day'},
      { value: 2, label: 'Weekdays'},
      { value: 3, label: 'Custom Schedule'},
    ]

    if (this.state.selectedOption.value === 'Custom Schedule') {
      return (
        <SettingItemMax
          title={localizeMessage('user.settings.notifications.schedule.title', 'Set Notifications Schedule')}
          inputs={[
            <div key='customNotificationSchedule'>
              <div className='mt-3'>
                <FormattedMessage
                    id='user.settings.notifications.scheduleInfo'
                    defaultMessage='You can schedule when you want to receive notifications. Outside of those times, your status will be set to Do Not Disturb and notifications will be disabled.'
                />
              </div>
              <div className='form-switch mt-3'>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={this.state.enableCusotmDND}
                    onChange={this.handelEnableChange}
                  />
                  <span className="slider round"></span>
                </label>
                <FormattedMessage
                  id='user.settings.notifications.schedule.enable'
                  defaultMessage='Enable notifications schedule'
                />
              </div>
              {this.state.enableCusotmDND ? (
                <div className="form-select">
                  <FormattedMessage
                    id='user.settings.notifications.schedule.allow'
                    defaultMessage='Allow notifications'
                  />
                  <div className="mt-2">
                    <ReactSelect
                      isDisabled={!this.state.enableCusotmDND}
                      className='react-select period'
                      classNamePrefix='react-select'
                      id='notificationSchedule'
                      options={options}
                      autosize={false}
                      clearable={false}
                      value={this.state.selectedOption}
                      isSearchable={false}
                      onChange={this.handlePeriodChange}
                      // ref={this.notificationScheduleRef}
                    />
                    <div className="weekDays-selector">
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="sunEnable" checked={this.state.sunEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="sunEnable">S</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="monEnable" checked={this.state.monEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="monEnable">M</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="tueEnable" checked={this.state.tueEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="tueEnable">T</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="wedEnable" checked={this.state.wedEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="wedEnable">W</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="thuEnable" checked={this.state.thuEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="thuEnable">T</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="friEnable" checked={this.state.friEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="friEnable">F</label>
                      <input disabled={!this.state.enableCusotmDND} type="checkbox" id="satEnable" checked={this.state.satEnable} onChange={this.handleWeekChange} className="weekday" />
                      <label htmlFor="satEnable">S</label>
                    </div>
                    <div className='form-time'>
                      {this.state.sunEnable ? (
                          <div className='time-wrapper custom-time'>
                          <div className='week-name'>Sunday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='sunStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='sunEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.monEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Monday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='monStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='monEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.tueEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Tuesday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='tueStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='tueEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.wedEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Wednesday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='wedStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
                            onChange={(value, id='wedEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.thuEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Thursday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='thuStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='thuEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.friEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Friday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='friStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='friEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      {this.state.satEnable ? (
                        <div className='time-wrapper custom-time'>
                          <div className='week-name'>Saturday</div>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='start'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='satStart') => this.handleTimeChange(value, id)}
                          />
                          <p>to</p>
                          <TimePicker
                            disabled={!this.state.enableCusotmDND}
                            className='time-picker'
                            showSecond={false}
                            format={timeFormat}
                            use12Hours
                            inputReadOnly
                            clearIcon={false}
                            placeholder='end'
                            defaultValue={moment()}
                            minuteStep={15}
                            inputIcon={(<img src={clockIcon} layout="fill" />)}
                            onChange={(value, id='satEnd') => this.handleTimeChange(value, id)}
                          />
                        </div>
                        ) : (
                          <div></div>
                        )
                      }
                      
                    </div>
                  </div>
                </div>
              ) : (
                  <div></div>
                )
              }
              
            </div>,
          ]}
          submit={this.handleSubmit}
          saving={this.props.saving}
          // server_error={this.props.serverError}
          width='full'
          updateSection={this.handleUpdateSection}
        />
      )
    } else {
      return (
        <SettingItemMax
          title={localizeMessage('user.settings.notifications.schedule.title', 'Set Notifications Schedule')}
          inputs={[
            <div key='NotificationSchedule'>
              <div className='mt-3'>
                <FormattedMessage
                    id='user.settings.notifications.scheduleInfo'
                    defaultMessage='You can schedule when you want to receive notifications. Outside of those times, your status will be set to Do Not Disturb and notifications will be disabled.'
                />
              </div>
              <div className='form-switch mt-3'>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={this.state.enableCusotmDND}
                    onChange={this.handelEnableChange}
                  />
                  <span className="slider round"></span>
                </label>
                <FormattedMessage
                  id='user.settings.notifications.schedule.enable'
                  defaultMessage='Enable notifications schedule'
                />
              </div>
              {this.state.enableCusotmDND ? (
                <div className="form-select">
                  <FormattedMessage
                    id='user.settings.notifications.schedule.allow'
                    defaultMessage='Allow notifications'
                  />
                  <div className="mt-2">
                    <ReactSelect
                      isDisabled={!this.state.enableCusotmDND}
                      className='react-select period'
                      classNamePrefix='react-select'
                      id='notificationSchedule'
                      options={options}
                      autosize={false}
                      clearable={false}
                      value={this.state.selectedOption}
                      isSearchable={false}
                      placeholder='Period'
                      onChange={this.handlePeriodChange}
                      // ref={this.notificationScheduleRef}
                    />
                    <div className='time-wrapper n-custom-time'>
                      <TimePicker
                        disabled={!this.state.enableCusotmDND}
                        className='time-picker'
                        showSecond={false}
                        format={timeFormat}
                        use12Hours
                        inputReadOnly
                        clearIcon={false}
                        onChange={(value, id='start') => this.handleTimeChange(value, id)}
                        placeholder='Start'
                        defaultValue={moment()}
                        minuteStep={15}
                        inputIcon={(<img src={clockIcon} layout="fill" />)}
                      />
                      <p>to</p>
                      <TimePicker
                        disabled={!this.state.enableCusotmDND}
                        className='time-picker'
                        showSecond={false}
                        format={timeFormat}
                        use12Hours
                        inputReadOnly
                        clearIcon={false}
                        onChange={(value, id='end') => this.handleTimeChange(value, id)}
                        placeholder='End'
                        defaultValue={moment()}
                        minuteStep={15}
                        inputIcon={(<img src={clockIcon} layout="fill" />)}
                      />
                    </div>
                  </div>
                </div>
              ): (
                <div></div>    
              )
            }
              
            </div>,
          ]}
          submit={this.handleSubmit}
          saving={this.props.saving}
          server_error={this.props.serverError}
          width='full'
          updateSection={this.handleUpdateSection}
        />
      )

    }

  }
  
  renderMinSettingView = () => {
    let description = (
      <FormattedMessage
        id='user.settings.schedule.time'
        defaultMessage='Every Day'
      />
    );
    return (
      <SettingItemMin
        title={localizeMessage('user.settings.notifications.schedule.title', 'Set Notifications Schedule')}
        describe={description}
        section={'schedule'}
        updateSection={this.handleUpdateSection}
      />
    ) 
  }

  render() {
    if (this.props.activeSection !== 'schedule') {
        return this.renderMinSettingView();
    }

    return this.renderMaxSettingView();
  }
}

export default set_notification_schedule;