// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';

import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import NeedsTeam from 'components/needs_team';
import PermalinkRedirector from 'components/permalink_redirector';
import {makeAsyncComponent} from 'components/async_load';
import BrowserStore from 'stores/browser_store.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import CompleteUserData from 'components/complete_user_data.jsx';

import loadErrorPage from 'bundle-loader?lazy!components/error_page';
import loadLoginController from 'bundle-loader?lazy!components/login/login_controller';
import loadAdminConsole from 'bundle-loader?lazy!components/admin_console';
import loadLoggedIn from 'bundle-loader?lazy!components/logged_in';
import loadPasswordResetSendLink from 'bundle-loader?lazy!components/password_reset_send_link';
import loadPasswordResetForm from 'bundle-loader?lazy!components/password_reset_form';
import loadSignupController from 'bundle-loader?lazy!components/signup/signup_controller';
import loadSignupEmail from 'bundle-loader?lazy!components/signup/signup_email';
import loadTermsOfService from 'bundle-loader?lazy!components/terms_of_service';
import loadShouldVerifyEmail from 'bundle-loader?lazy!components/should_verify_email';
import loadDoVerifyEmail from 'bundle-loader?lazy!components/do_verify_email';
import loadClaimController from 'bundle-loader?lazy!components/claim';
import loadHelpController from 'bundle-loader?lazy!components/help/help_controller';
import loadGetIosApp from 'bundle-loader?lazy!components/get_ios_app';
import loadGetAndroidApp from 'bundle-loader?lazy!components/get_android_app';
import loadSelectTeam from 'bundle-loader?lazy!components/select_team';
import loadAuthorize from 'bundle-loader?lazy!components/authorize';
import loadCreateTeam from 'bundle-loader?lazy!components/create_team';
import loadMfa from 'bundle-loader?lazy!components/mfa/mfa_controller';

const CreateTeam = makeAsyncComponent(loadCreateTeam);
const ErrorPage = makeAsyncComponent(loadErrorPage);
const TermsOfService = makeAsyncComponent(loadTermsOfService);
const LoginController = makeAsyncComponent(loadLoginController);
const AdminConsole = makeAsyncComponent(loadAdminConsole);
const LoggedIn = makeAsyncComponent(loadLoggedIn);
const PasswordResetSendLink = makeAsyncComponent(loadPasswordResetSendLink);
const PasswordResetForm = makeAsyncComponent(loadPasswordResetForm);
const SignupController = makeAsyncComponent(loadSignupController);
const SignupEmail = makeAsyncComponent(loadSignupEmail);
const ShouldVerifyEmail = makeAsyncComponent(loadShouldVerifyEmail);
const DoVerifyEmail = makeAsyncComponent(loadDoVerifyEmail);
const ClaimController = makeAsyncComponent(loadClaimController);
const HelpController = makeAsyncComponent(loadHelpController);
const GetIosApp = makeAsyncComponent(loadGetIosApp);
const GetAndroidApp = makeAsyncComponent(loadGetAndroidApp);
const SelectTeam = makeAsyncComponent(loadSelectTeam);
const Authorize = makeAsyncComponent(loadAuthorize);
const Mfa = makeAsyncComponent(loadMfa);

const LoggedInRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => (
            <LoggedIn {...props}>
                <Component {...props}/>
            </LoggedIn>
        )}
    />
);

export default class RootSwitch extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string,
        defaultRoute: PropTypes.string.isRequired,
        noAccounts: PropTypes.bool.isRequired,
        mfaRequired: PropTypes.bool.isRequired,
        showTermsOfService: PropTypes.bool.isRequired,
        iosDownloadLink: PropTypes.string,
        androidDownloadLink: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.state = {
            currentUserIdSet: 0,
            showTermsOfServiceSet: 0,
        };
    }

    componentDidUpdate(prevProps) {
        /* eslint-disable react/no-did-update-set-state */

        // Record the time when the currentUserId is first set.
        if (!prevProps.currentUserId && this.props.currentUserId) {
            this.setState({
                currentUserIdSet: Date.now(),
            });
        }

        // Record the time when showTermsOfService is first set.
        if (!prevProps.showTermsOfService && this.props.showTermsOfService) {
            this.setState({
                showTermsOfServiceSet: Date.now(),
            });
        }
    }

    shouldShowTermsOfService() {
        // Honour a request to show terms of service only within 15 seconds of transitioning to
        // the logged in state with the showTermsOfService bit set. This prevents forcing all users
        // through the terms of service flow when enabled until they next login or refresh the
        // page.
        return this.props.showTermsOfService &&
            this.state.showTermsOfServiceSet > 0 &&
            Math.abs(this.state.showTermsOfServiceSet - this.state.currentUserIdSet) < 15 * 1000;
    }

    render() {
        let routes = [];

        routes = routes.concat([
            <Route
                key={'/error'}
                path={'/error'}
                component={ErrorPage}
            />,
            <HFTRoute
                key={'/login'}
                path={'/login'}
                component={LoginController}
            />,
            <HFTRoute
                key={'/reset_password'}
                path={'/reset_password'}
                component={PasswordResetSendLink}
            />,
            <HFTRoute
                key={'/reset_password_complete'}
                path={'/reset_password_complete'}
                component={PasswordResetForm}
            />,
            <HFTRoute
                key={'/signup_email'}
                path={'/signup_email'}
                component={SignupEmail}
            />,
            <HFTRoute
                key={'/should_verify_email'}
                path={'/should_verify_email'}
                component={ShouldVerifyEmail}
            />,
            <HFTRoute
                key={'/do_verify_email'}
                path={'/do_verify_email'}
                component={DoVerifyEmail}
            />,
            <HFTRoute
                key={'/claim'}
                path={'/claim'}
                component={ClaimController}
            />,
            <HFTRoute
                key={'/help'}
                path={'/help'}
                component={HelpController}
            />,
        ]);

        // Setup handling for the sign up controller. If there are no accounts, force creation.
        routes.push(
            <HFTRoute
                key={'/signup_user_complete'}
                path={'/signup_user_complete'}
                component={SignupController}
            />
        );
        if (this.props.noAccounts) {
            routes.push(
                <Redirect
                    key={'/signup_user_complete'}
                    to={'/signup_user_complete'}
                />
            );
        }

        // Setup the MFA route. If MFA setup is required, force the user through the flow.
        routes.push(
            <LoggedInRoute
                key={'/mfa'}
                path={'/mfa'}
                component={Mfa}
            />
        );

        if (this.props.mfaRequired) {
            routes.push(
                <Redirect
                    key={'/mfa?redirect'}
                    to={'/mfa?redirect_to=' + encodeURIComponent(this.props.location.pathname)}
                />
            );
        }

        // Setup the TOS route. If the TOS flow is required, force the user through it.
        routes.push(
            <LoggedInRoute
                key={'/terms_of_service'}
                path={'/terms_of_service'}
                component={TermsOfService}
            />
        );

        if (this.shouldShowTermsOfService()) {
            routes.push(
                <Redirect
                    key='/terms_of_service?redirect_to'
                    to={'/terms_of_service?redirect_to=' + encodeURIComponent(this.props.location.pathname)}
                />
            );
        }

        const seenLandingPage = BrowserStore.hasSeenLandingPage();
        const promptIosDownload = this.props.iosDownloadLink && UserAgent.isIosWeb() && !seenLandingPage;
        const promptAndroidDownload = this.props.androidDownloadLink && UserAgent.isAndroidWeb() && !seenLandingPage;

        // Prompt an iOS customer to try the app, unless already seen.
        routes.push(
            <Route
                key={'/get_ios_app'}
                path={'/get_ios_app'}
                component={GetIosApp}
            />
        );
        if (promptIosDownload) {
            BrowserStore.setLandingPageSeen(true);
            routes.push(
                <Redirect
                    key='/get_ios_app?redirect_to'
                    to={'/get_ios_app?redirect_to=' + encodeURIComponent(this.props.location.pathname)}
                />
            );
        }

        // Prompt an Android customer to try the app, unless already seen.
        routes.push(
            <Route
                key={'/get_android_app'}
                path={'/get_android_app'}
                component={GetAndroidApp}
            />
        );
        if (promptAndroidDownload) {
            BrowserStore.setLandingPageSeen(true);
            routes.push(
                <Redirect
                    key='/get_android_app?redirect_to'
                    to={'/get_android_app?redirect_to=' + encodeURIComponent(this.props.location.pathname)}
                />
            );
        }

        routes = routes.concat([
            <LoggedInRoute
                key={'/admin_console'}
                path={'/admin_console'}
                component={AdminConsole}
            />,
            <LoggedInHFTRoute
                key={'/select_team'}
                path={'/select_team'}
                component={SelectTeam}
            />,
            <LoggedInHFTRoute
                key={'/oauth/authorize'}
                path={'/oauth/authorize'}
                component={Authorize}
            />,
            <LoggedInHFTRoute
                key={'/create_team'}
                path={'/create_team'}
                component={CreateTeam}
            />,
            <LoggedInRoute
                key={'/_redirect'}
                path={['/_redirect/integrations*', '/_redirect/pl/:postid', '/_redirect/messages/@:username']}
                component={PermalinkRedirector}
            />,
            <LoggedInRoute
                key={'/:team'}
                path={'/:team'}
                component={NeedsTeam}
            />,
        ]);

        // If the defaultRoute is '/`, there is insufficient data to
        // determine where to route the user. Render a loading screen
        // while fetching new data until the defaultRoute changes.
        if (this.props.defaultRoute === '/') {
            routes.push(
                <Route
                    key={'/'}
                    path={'/'}
                    component={CompleteUserData}
                />
            );
        }

        routes.push(
            <Redirect
                key={'/default'}
                to={{
                    ...this.props.location,
                    pathname: this.props.defaultRoute,
                }}
            />
        );

        return (
            <Switch>
                {routes}
            </Switch>
        );
    }
}
