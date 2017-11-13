// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';

export default class MFAController extends React.Component {
    componentDidMount() {
        if (window.mm_license.MFA !== 'true' || window.mm_config.EnableMultifactorAuthentication !== 'true') {
            browserHistory.push('/');
        }
    }

    render() {
        let backButton;
        if (window.mm_config.EnforceMultifactorAuthentication === 'true') {
            backButton = (
                <div className='signup-header'>
                    <button
                        className='style--none color--link'
                        onClick={(e) => {
                            e.preventDefault();
                            emitUserLoggedOutEvent('/login');
                        }}
                    >
                        <span className='fa fa-chevron-left'/>
                        <FormattedMessage
                            id='web.header.logout'
                            defaultMessage='Logout'
                        />
                    </button>
                </div>
            );
        } else {
            backButton = (<BackButton/>);
        }

        return (
            <div className='inner-wrap sticky'>
                <div className='content'>
                    <div>
                        {backButton}
                        <div className='col-sm-12'>
                            <div className='signup-team__container'>
                                <h3>
                                    <FormattedMessage
                                        id='mfa.setupTitle'
                                        defaultMessage='Multi-factor Authentication Setup'
                                    />
                                </h3>
                                <img
                                    className='signup-team-logo'
                                    src={logoImage}
                                />
                                <div id='mfa'>
                                    {React.cloneElement(this.props.children, {})}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MFAController.defaultProps = {
};
MFAController.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node
};
