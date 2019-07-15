// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import {AdvancedSections} from 'utils/constants.jsx';

export default class JoinLeaveSection extends React.PureComponent {
    static propTypes = {
        activeSection: PropTypes.string,
        currentUserId: PropTypes.string.isRequired,
        joinLeave: PropTypes.string,
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
            joinLeaveState: props.joinLeave,
        };
    }

    handleOnChange = (e) => {
        const value = e.currentTarget.value;

        this.setState({joinLeaveState: value});
    }

    handleUpdateSection = (section) => {
        if (!section) {
            this.setState({joinLeaveState: this.props.joinLeave});
        }

        this.props.onUpdateSection(section);
    }

    handleSubmit = () => {
        const {actions, currentUserId, onUpdateSection} = this.props;
        const joinLeavePreference = {category: Preferences.CATEGORY_ADVANCED_SETTINGS, user_id: currentUserId, name: Preferences.ADVANCED_FILTER_JOIN_LEAVE, value: this.state.joinLeaveState};
        actions.savePreferences(currentUserId, [joinLeavePreference]);

        onUpdateSection();
    }

    render() {
        const {joinLeaveState} = this.state;
        if (this.props.activeSection === AdvancedSections.JOIN_LEAVE) {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.advance.joinLeaveTitle'
                            defaultMessage='Enable Join/Leave Messages'
                        />
                    }
                    inputs={[
                        <fieldset key='joinLeaveSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='joinLeaveOn'
                                        type='radio'
                                        value={'true'}
                                        name={AdvancedSections.JOIN_LEAVE}
                                        checked={joinLeaveState === 'true'}
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
                                        id='joinLeaveOff'
                                        type='radio'
                                        value={'false'}
                                        name={AdvancedSections.JOIN_LEAVE}
                                        checked={joinLeaveState === 'false'}
                                        onChange={this.handleOnChange}
                                    />
                                    <FormattedMessage
                                        id='user.settings.advance.off'
                                        defaultMessage='Off'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='margin-top x3'>
                                <FormattedMessage
                                    id='user.settings.advance.joinLeaveDesc'
                                    defaultMessage='When "On", System Messages saying a user has joined or left a channel will be visible. When "Off", the System Messages about joining or leaving a channel will be hidden. A message will still show up when you are added to a channel, so you can receive a notification.'
                                />
                            </div>
                        </fieldset>,
                    ]}
                    setting={AdvancedSections.JOIN_LEAVE}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        return (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.advance.joinLeaveTitle'
                        defaultMessage='Enable Join/Leave Messages'
                    />
                }
                describe={this.props.renderOnOffLabel(joinLeaveState)}
                focused={this.props.prevActiveSection === AdvancedSections.JOIN_LEAVE}
                section={AdvancedSections.JOIN_LEAVE}
                updateSection={this.handleUpdateSection}
            />
        );
    }
}
