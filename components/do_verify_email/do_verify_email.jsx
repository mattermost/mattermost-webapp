// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

export default class DoVerifyEmail extends React.PureComponent {
    static propTypes = {

        /**
         * Object with validation parameters given in link
         */
        location: PropTypes.object.isRequired,

        /**
         * Title of the app or site.
         */
        siteName: PropTypes.string,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to verify the user's email
             */
            verifyUserEmail: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            verifyStatus: 'pending',
            serverError: '',
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.verifyEmail();
    }

    verifyEmail = async () => {
        const {actions: {verifyUserEmail}} = this.props;
        const verify = await verifyUserEmail((new URLSearchParams(this.props.location.search)).get('token'));

        if (verify && verify.data) {
            browserHistory.push('/login?extra=verified&email=' + encodeURIComponent((new URLSearchParams(this.props.location.search)).get('email')));
        } else if (verify && verify.error) {
            const serverError = (
                <FormattedMessage
                    id='signup_user_completed.invalid_invite'
                    defaultMessage='The invite link was invalid.  Please speak with your Administrator to receive an invitation.'
                />
            );
            this.setState({
                verifyStatus: 'failure',
                serverError,
            });
        }
    }

    render() {
        if (this.state.verifyStatus !== 'failure') {
            return (<LoadingScreen/>);
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <h1>{this.props.siteName}</h1>
                            <h4 className='color--light'>
                                <FormattedMessage
                                    id='web.root.signup_info'
                                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                                />
                            </h4>
                            {serverError}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DoVerifyEmail.defaultProps = {
    location: {},
};
