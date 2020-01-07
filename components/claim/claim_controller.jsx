// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';

import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button';
import OAuthToEmail from 'components/claim/components/oauth_to_email';
import EmailToOAuth from 'components/claim/components/email_to_oauth';
import LDAPToEmail from 'components/claim/components/ldap_to_email';
import EmailToLDAP from 'components/claim/components/email_to_ldap';

export default class ClaimController extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        siteName: PropTypes.string,
        ldapLoginFieldName: PropTypes.string,
        passwordConfig: PropTypes.object,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,

        actions: PropTypes.shape({
            switchLdapToEmail: PropTypes.func.isRequired,
        }).isRequired,
    };

    render() {
        const email = (new URLSearchParams(this.props.location.search)).get('email');
        const newType = (new URLSearchParams(this.props.location.search)).get('new_type');
        const currentType = (new URLSearchParams(this.props.location.search)).get('old_type');

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            alt={'signup logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div id='claim'>
                            <Switch>
                                <Route
                                    path={`${this.props.match.url}/oauth_to_email`}
                                    render={() => (
                                        <OAuthToEmail
                                            currentType={currentType}
                                            email={email}
                                            siteName={this.props.siteName}
                                            passwordConfig={this.props.passwordConfig}
                                        />
                                    )}
                                />
                                <Route
                                    path={`${this.props.match.url}/email_to_oauth`}
                                    render={() => (
                                        <EmailToOAuth
                                            newType={newType}
                                            email={email}
                                            siteName={this.props.siteName}
                                        />
                                    )}
                                />
                                <Route
                                    path={`${this.props.match.url}/ldap_to_email`}
                                    render={() => (
                                        <LDAPToEmail
                                            email={email}
                                            passwordConfig={this.props.passwordConfig}
                                            switchLdapToEmail={this.props.actions.switchLdapToEmail}
                                        />
                                    )}
                                />
                                <Route
                                    path={`${this.props.match.url}/email_to_ldap`}
                                    render={() => (
                                        <EmailToLDAP
                                            email={email}
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
