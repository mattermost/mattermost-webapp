// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {loadMe} from 'actions/user_actions.jsx';
import Constants from 'utils/constants.jsx';
import Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;

export default class Confirm extends React.Component {
    componentDidMount() {
        document.body.addEventListener('keydown', this.onKeyPress);
    }

    componentWillUnmount() {
        document.body.removeEventListener('keydown', this.onKeyPress);
    }

    submit = (e) => {
        e.preventDefault();
        loadMe().then(() => {
            this.props.history.push('/');
        });
    }

    onKeyPress = (e) => {
        if (Utils.isKeyPressed(e, KeyCodes.ENTER)) {
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
                        <FormattedHTMLMessage
                            id='mfa.confirm.complete'
                            defaultMessage='<strong>Set up complete!</strong>'
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

Confirm.defaultProps = {
};
Confirm.propTypes = {
};
