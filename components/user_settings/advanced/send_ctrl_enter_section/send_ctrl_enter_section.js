// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import {AdvancedSections} from 'utils/constants.jsx';

export default class SendCtrlEnterSection extends React.PureComponent {
    static propTypes = {
        activeSection: PropTypes.string,
        currentUserId: PropTypes.string.isRequired,
        sendMessageOnCtrlEnter: PropTypes.string,
        onUpdateSection: PropTypes.func.isRequired,
        prevActiveSection: PropTypes.string,
        renderOnOffLabel: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            sendMessageOnCtrlEnterState: props.sendMessageOnCtrlEnter,
            isSaving: false,
        };
    }

    handleOnChange = (e) => {
        const value = e.currentTarget.value;

        this.setState({sendMessageOnCtrlEnterState: value});
    }

    handleSubmit = () => {
        const {actions, currentUserId, onUpdateSection} = this.props;
        const sendOnCtrlEnterPreference = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: Preferences.ADVANCED_SEND_ON_CTRL_ENTER,
            value: this.state.sendMessageOnCtrlEnterState,
        };

        this.setState({isSaving: true});
        actions.savePreferences(currentUserId, [sendOnCtrlEnterPreference]);
        onUpdateSection();
    }

    render() {
        const {sendMessageOnCtrlEnterState} = this.state;

        let sendOnCtrlEnterSection = (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.advance.sendTitle'
                        defaultMessage='Send messages on CTRL+ENTER'
                    />
                }
                describe={this.props.renderOnOffLabel(sendMessageOnCtrlEnterState)}
                focused={this.props.prevActiveSection === AdvancedSections.CONTROL_SEND}
                section={AdvancedSections.CONTROL_SEND}
                updateSection={this.handleUpdateSection}
            />
        );
        if (this.props.activeSection === AdvancedSections.CONTROL_SEND) {
            sendOnCtrlEnterSection = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.advance.sendTitle'
                            defaultMessage='Send messages on CTRL+ENTER'
                        />
                    }
                    inputs={[
                        <div key='ctrlSendSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='sendOnCtrlEnterOn'
                                        type='radio'
                                        value={'true'}
                                        name={AdvancedSections.CONTROL_SEND}
                                        checked={sendMessageOnCtrlEnterState === 'true'}
                                        onChange={this.handleOnChange}
                                    />
                                    <FormattedMessage
                                        id='user.settings.advance.on'
                                        defaultMessage='On'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='sendOnCtrlEnterOff'
                                        type='radio'
                                        value={'false'}
                                        name={AdvancedSections.CONTROL_SEND}
                                        checked={sendMessageOnCtrlEnterState === 'false'}
                                        onChange={this.handleOnChange}
                                    />
                                    <FormattedMessage
                                        id='user.settings.advance.off'
                                        defaultMessage='Off'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.advance.sendDesc'
                                    defaultMessage='If enabled ENTER inserts a new line and CTRL+ENTER submits the message.'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={Preferences.ADVANCED_SEND_ON_CTRL_ENTER}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        return (
            <React.Fragment>
                <div className='divider-light'/>
                {sendOnCtrlEnterSection}
            </React.Fragment>
        );
    }
}
