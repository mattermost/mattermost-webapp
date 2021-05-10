import React from 'react';
import ReactSelect from 'react-select';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';

import { localizeMessage } from 'utils/utils.jsx';
import { FormattedMessage } from 'react-intl';

import './notification_schedule_setting.scss'

import SettingItemMin from 'components/setting_item_min';
import SettingItemMax from 'components/setting_item_max.jsx';

import clockIcon from 'images/icons/clock-time-five.png';
// type Props = {
//   activeSection: string;
//   updateSection: (section: string) => void;
//   onSubmit: () => void;
//   onCancel: () => void;
//   onChange: (enableEmail: string) => void;
//   serverError?: string;
//   saving?: boolean;
// };

// type State = {
//   activeSection: string;
// };

const timeFormat = 'h:mm A'

class set_notification_schedule extends React.PureComponent {
  constructor(props) {
    super(props);

    const {
        activeSection,
    } = props;


    this.state = {
      activeSection,
      enableCusotmDND: false, // 나중에 props로 상태값 받아와야함
      selectedOption: { value: 'Every Day', label: 'Every Day'}, // 나중에 props로 상태값 받아와야함
      monEnable: false,
      tueEnable: false,
      wedEnable: false,
      thuEnable: false,
      friEnable: false,
      satEnable: false,
      sunEnable: false,
    };
  }

  handleSubmit = async () => {
    this.props.updateSection('');
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

  onPeriodChange = (option) => {
    this.setState({
      selectedOption: option
    })
  }

  handleTimeChange = (e) => {
    console.log(e.format('hh:mm'))
  }

  handleWeekChange = (e) => {
    this.setState({
      [e.target.id]: e.target.checked
    })
  }

  renderMaxSettingView = () => {
    const options = [
      { value: 'Every Day', label: 'Every Day'},
      { value: 'Weekdays', label: 'Weekdays'},
      { value: 'Custom Schedule', label: 'Custom Schedule'},
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
                      onChange={this.onPeriodChange}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
                            inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
          server_error={this.props.serverError}
          width='full'
          updateSection={this.handleUpdateSection}
        />
      )
    }

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
                    onChange={this.onPeriodChange}
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
                      onChange={this.handleTimeChange}
                      placeholder='start'
                      defaultValue={moment()}
                      minuteStep={15}
                      inputIcon={(<img src={clockIcon} layout="fill"/>)}
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
  
  renderMinSettingView = () => {
    let description = (
      <FormattedMessage
        id='user.settings.schedule.time'
        defaultMessage='시간시간'
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