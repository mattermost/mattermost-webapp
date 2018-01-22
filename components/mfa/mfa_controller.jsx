// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Route, Switch} from 'react-router-dom';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button.jsx';
import Setup from 'components/mfa/components/setup';
import Confirm from 'components/mfa/components/confirm';

export default class MFAController extends React.Component {
    componentDidMount() {
        if (window.mm_license.MFA !== 'true' || window.mm_config.EnableMultifactorAuthentication !== 'true') {
            this.props.history.push('/');
        }
    }

    handleOnClick = (e) => {
        e.preventDefault();
        emitUserLoggedOutEvent('/login');
    }

    render() {
        let backButton;
        if (window.mm_config.EnforceMultifactorAuthentication === 'true') {
            backButton = (
                <div className='signup-header'>
                    <button
                        className='style--none color--link'
                        onClick={this.handleOnClick}
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
                                    <Switch>
                                        <Route
                                            path={`${this.props.match.url}/setup`}
                                            render={(props) => (
                                                <Setup
                                                    state={this.state}
                                                    updateParent={this.updateParent}
                                                    {...props}
                                                />
                                        )}
                                        />
                                        <Route
                                            path={`${this.props.match.url}/confirm`}
                                            render={(props) => (
                                                <Confirm
                                                    state={this.state}
                                                    updateParent={this.updateParent}
                                                    {...props}
                                                />
                                        )}
                                        />
                                    </Switch>
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
