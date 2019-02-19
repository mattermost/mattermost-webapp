// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isErrorInvalidSlashCommand} from 'utils/post_utils.jsx';

class MessageSubmitError extends React.PureComponent {
    static propTypes = {
        error: PropTypes.object.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        submittedMessage: PropTypes.string,
    }

    renderSlashCommandError = () => {
        if (!this.props.submittedMessage) {
            return this.props.error.message;
        }

        const command = this.props.submittedMessage.split(' ')[0];
        return (
            <React.Fragment>
                <FormattedMessage
                    id='message_submit_error.invalidCommand'
                    defaultMessage={'Command with a trigger of \'{command}\' not found. '}
                    values={{
                        command,
                    }}
                />
                <a
                    href='#'
                    onClick={this.props.handleSubmit}
                >
                    <FormattedMessage
                        id='message_submit_error.sendAsMessageLink'
                        defaultMessage='Click here to send as a message.'
                    />
                </a>
            </React.Fragment>
        );
    }

    render() {
        const error = this.props.error;

        if (!error) {
            return null;
        }

        let errorContent = error.message;
        if (isErrorInvalidSlashCommand(error)) {
            errorContent = this.renderSlashCommandError();
        }

        return (
            <div className='has-error'>
                <label className='control-label'>
                    {errorContent}
                </label>
            </div>
        );
    }
}

export default MessageSubmitError;
