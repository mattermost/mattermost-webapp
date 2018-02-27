// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import AutosizeTextarea from 'components/autosize_textarea.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import {localizeMessage} from 'utils/utils.jsx';

const MESSAGE_MAX_LENGTH = 200;

export default class ManageAutoReply extends React.Component {

    handleAutoReplyChecked = (e) => {
        this.props.setParentState('autoReplyActive', e.target.checked);
    };

    onMessageChanged = (e) => {
        this.props.setParentState('autoReplyMessage', e.target.value);
    };

    render() {
        const {
            autoReplyActive,
            autoReplyMessage
        } = this.props;

        let serverError;
        if (this.props.error) {
            serverError = <label className='has-error'>{this.props.error}</label>;
        }

        const inputs = [];

        const activeToggle = (
            <div className='checkbox'>
                <label>
                    <input
                        id='autoReplyActive'
                        type='checkbox'
                        checked={autoReplyActive}
                        onChange={this.handleAutoReplyChecked}
                    />
                    {autoReplyActive ? (
                        <FormattedMessage
                            id='user.settings.notifications.autoResponderEnabled'
                            defaultMessage='Enabled'
                        />
                    ) : (
                        <FormattedMessage
                            id='user.settings.notifications.autoResponderDisabled'
                            defaultMessage='Disabled'
                        />
                    )}
                </label>
            </div>
        );

        const message = (
            <div key='changeMessage'>
                <div className='padding-top'>
                    <AutosizeTextarea
                        style={{resize: 'none'}}
                        id='notificationAutoReplyMessage'
                        className='form-control'
                        rows='5'
                        placeholder={localizeMessage('user.settings.notifications.autoResponderPlaceholder', 'Message')}
                        value={autoReplyMessage}
                        maxLength={MESSAGE_MAX_LENGTH}
                        onChange={this.onMessageChanged}
                    />
                    {serverError}
                </div>
            </div>
        );

        inputs.push(activeToggle);
        if (autoReplyActive) {
            inputs.push(message);
        }
        inputs.push((
            <div>
                <br/>
                <FormattedHTMLMessage
                    id='user.settings.notifications.autoResponderHint'
                    defaultMessage='When enabled, sends a custom message. Direct messages will trigger a response. Mentions in channels will not trigger a response.'
                />
            </div>
        ));

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.notifications.autoResponder'
                        defaultMessage='Auto Responder'
                    />
                }
                containerStyle={{
                    overflow: 'visible',
                    display: 'table',
                    width: '100%'
                }}
                width='medium'
                shiftEnter={true}
                submit={this.props.submit}
                saving={this.props.saving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

ManageAutoReply.propTypes = {
    autoReplyActive: PropTypes.bool.isRequired,
    autoReplyMessage: PropTypes.string.isRequired,
    updateSection: PropTypes.func.isRequired,
    setParentState: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string
};
