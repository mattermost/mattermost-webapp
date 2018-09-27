// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import {AdvancedSections} from 'utils/constants.jsx';

export default class CodeBlockCtrlEnterSection extends React.PureComponent {
    static propTypes = {
        activeSection: PropTypes.string,
        currentUserId: PropTypes.string.isRequired,
        codeBlockOnCtrlEnter: PropTypes.string,
        sendMessageOnCtrlEnter: PropTypes.bool,
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
            codeBlockOnCtrlEnterState: props.codeBlockOnCtrlEnter,
        };
    }

    handleOnChange = (e) => {
        const value = e.currentTarget.value;

        this.setState({codeBlockOnCtrlEnterState: value});
    }

    handleSubmit = () => {
        const {actions, currentUserId, onUpdateSection} = this.props;
        const codeBlockOnCtrlEnterPreference = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: 'code_block_ctrl_enter',
            value: this.state.codeBlockOnCtrlEnterState,
        };

        actions.savePreferences(currentUserId, [codeBlockOnCtrlEnterPreference]);
        onUpdateSection();
    }

    render() {
        if (this.props.sendMessageOnCtrlEnter) {
            return null;
        }

        const {codeBlockOnCtrlEnterState} = this.state;

        let codeBlockOnCtrlEnterSection = (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.advance.codeBlockOnCtrlEnterSendTitle'
                        defaultMessage='Send code block messages on CTRL + ENTER'
                    />
                }
                describe={this.props.renderOnOffLabel(codeBlockOnCtrlEnterState)}
                focused={this.props.prevActiveSection === AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER}
                section={AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER}
                updateSection={this.props.onUpdateSection}
            />
        );
        if (this.props.activeSection === AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER) {
            codeBlockOnCtrlEnterSection = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.advance.codeBlockOnCtrlEnterSendTitle'
                            defaultMessage='Send code block messages on CTRL + ENTER'
                        />
                    }
                    inputs={[
                        <div key='codeBlockOnCtrlEnterSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='codeBlockOnCtrlEnterOn'
                                        type='radio'
                                        value={'true'}
                                        name={AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER}
                                        checked={codeBlockOnCtrlEnterState === 'true'}
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
                                        id='codeBlockOnCtrlEnterOff'
                                        type='radio'
                                        value={'false'}
                                        name={AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER}
                                        checked={codeBlockOnCtrlEnterState === 'false'}
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
                                    id='user.settings.advance.codeBlockOnCtrlEnterSendDesc'
                                    defaultMessage='If enabled, ENTER inserts a new line within messages formatted as code starting with ```. CTRL + ENTER submits the message.'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.props.onUpdateSection}
                />
            );
        }

        return (
            <React.Fragment>
                <div className='divider-light'/>
                {codeBlockOnCtrlEnterSection}
            </React.Fragment>
        );
    }
}
