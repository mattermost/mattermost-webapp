// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Route, Switch} from 'react-router-dom';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button';
import LogoutIcon from 'components/widgets/icons/fa_logout_icon';

import Setup from '../setup';
import Confirm from '../confirm';

export default class MFAController extends React.PureComponent {
    componentDidMount() {
        document.body.classList.add('sticky');
        document.getElementById('root').classList.add('container-fluid');

        if (!this.props.enableMultifactorAuthentication) {
            this.props.history.push('/');
        }
    }

    componentWillUnmount() {
        document.body.classList.remove('sticky');
        document.getElementById('root').classList.remove('container-fluid');
    }

    handleOnClick = (e) => {
        e.preventDefault();
        emitUserLoggedOutEvent('/login');
    }

    render() {
        let backButton;
        if (this.props.mfa && this.props.enforceMultifactorAuthentication) {
            backButton = (
                <div className='signup-header'>
                    <button
                        className='style--none color--link'
                        onClick={this.handleOnClick}
                    >
                        <LogoutIcon/>
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
            <div className='inner-wrap'>
                <div className='row content'>
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
                                    alt={'signup team logo'}
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

MFAController.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node,
    mfa: PropTypes.bool.isRequired,
    enableMultifactorAuthentication: PropTypes.bool.isRequired,
    enforceMultifactorAuthentication: PropTypes.bool.isRequired,

    /*
     * Object from react-router
     */
    match: PropTypes.shape({
        url: PropTypes.string.isRequired,
    }).isRequired,
};
