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
      selectedOption: '', // 나중에 props로 상태값 받아와야함
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
    console.log(option)
    this.setState({
      selectedOption: option
    })
  }

  renderMaxSettingView = () => {
    const options = [
      { value: 'Every Day', label: 'Every Day'},
      { value: 'Weekdays', label: 'Weekdays'},
      { value: 'Custom Schedule', label: 'Custom Schedule'},
    ]

    if (this.state.selectedOption.value === 'Custom Schedule') {
      console.log('커스텀')
    }
    return (
      
      <SettingItemMax
        title={localizeMessage('user.settings.notifications.schedule.title', 'Set Notifications Schedule')}
        inputs={[
          <div>
            <div className='form-switch'>
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
            <div className="form-select">
              <FormattedMessage
                id='user.settings.notifications.schedule.allow'
                defaultMessage='Allow notifications'
              />
              <div>
                <ReactSelect
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
                <div className='time-wrapper'>
                  <TimePicker
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
            <div className='mt-3'>
              <FormattedMessage
                  id='user.settings.notifications.scheduleInfo'
                  defaultMessage='You can schedule when you want to receive notifications. Outside of those times, your status will be set to Do Not Disturb and notifications will be disabled.'
              />
            </div>
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