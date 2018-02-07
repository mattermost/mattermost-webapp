// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';

import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button.jsx';
import OAuthToEmail from 'components/claim/components/oauth_to_email';
import EmailToOAuth from 'components/claim/components/email_to_oauth';
import LDAPToEmail from 'components/claim/components/ldap_to_email';
import EmailToLDAP from 'components/claim/components/email_to_ldap';

export default class ClaimController extends React.Component {
    componentWillMount() {
        this.setState({
            email: (new URLSearchParams(this.props.location.search)).get('email'),
            newType: (new URLSearchParams(this.props.location.search)).get('new_type'),
            currentType: (new URLSearchParams(this.props.location.search)).get('old_type')
        });
    }

    render() {
        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div id='claim'>
                            <Switch>
                                <Route
                                    path={`${this.props.match.url}/oauth_to_email`}
                                    render={(props) => (
                                        <OAuthToEmail
                                            {...this.state}
                                            {...props}
                                            siteName={this.props.siteName}
                                        />
                                )}
                                />
                                <Route
                                    path={`${this.props.match.url}/email_to_oauth`}
                                    render={(props) => (
                                        <EmailToOAuth
                                            {...this.state}
                                            {...props}
                                            siteName={this.props.siteName}
                                        />
                                )}
                                />
                                <Route
                                    path={`${this.props.match.url}/ldap_to_email`}
                                    render={(props) => (
                                        <LDAPToEmail
                                            {...this.state}
                                            {...props}
                                            siteName={this.props.siteName}
                                        />
                                )}
                                />
                                <Route
                                    path={`${this.props.match.url}/email_to_ldap`}
                                    render={(props) => (
                                        <EmailToLDAP
                                            {...this.state}
                                            {...props}
                                            siteName={this.props.siteName}
                                            ldapLoginFieldName={this.props.ldapLoginFieldName}
                                        />
                                )}
                                />
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ClaimController.propTypes = {
    location: PropTypes.object.isRequired,
    siteName: PropTypes.string,
    ldapLoginFieldName: PropTypes.string
};
