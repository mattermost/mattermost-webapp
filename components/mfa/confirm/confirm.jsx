// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const KeyCodes = Constants.KeyCodes;

export default class Confirm extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({
            redirectUserToDefaultTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentDidMount() {
        document.body.addEventListener('keydown', this.onKeyPress);
    }

    componentWillUnmount() {
        document.body.removeEventListener('keydown', this.onKeyPress);
    }

    submit = (e) => {
        e.preventDefault();
        this.props.actions.redirectUserToDefaultTeam();
    }

    onKeyPress = (e) => {
        if (isKeyPressed(e, KeyCodes.ENTER)) {
            this.submit(e);
        }
    }

    render() {
        return (
            <div>
                <form
                    onSubmit={this.submit}
                    onKeyPress={this.onKeyPress}
                    className='form-group'
                >
                    <p>
                        <FormattedMarkdownMessage
                            id='mfa.confirm.complete'
                            defaultMessage='**Set up complete!**'
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='mfa.confirm.secure'
                            defaultMessage='Your account is now secure. Next time you sign in, you will be asked to enter a code from the Google Authenticator app on your phone.'
                        />
                    </p>
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='mfa.confirm.okay'
                            defaultMessage='Okay'
                        />
                    </button>
                </form>
            </div>
        );
    }
}
