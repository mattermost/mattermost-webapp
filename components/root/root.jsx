// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {rudderAnalytics, Client4} from 'mattermost-redux/client';
import PropTypes from 'prop-types';
import React from 'react';
import FastClick from 'fastclick';
import {Route, Switch, Redirect} from 'react-router-dom';
import {setUrl} from 'mattermost-redux/actions/general';
import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import * as UserAgent from 'utils/user_agent';
import {EmojiIndicesByAlias} from 'utils/emoji.jsx';
import {trackLoadTime} from 'actions/telemetry_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import {loadRecentlyUsedCustomEmojis} from 'actions/emoji_actions.jsx';
import {initializePlugins} from 'plugins';
import 'plugins/export.js';
import Pluggable from 'plugins/pluggable';
import Constants, {StoragePrefixes} from 'utils/constants';
import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import IntlProvider from 'components/intl_provider';
import NeedsTeam from 'components/needs_team';
import {makeAsyncComponent} from 'components/async_load';

const LazyErrorPage = React.lazy(() => import('components/error_page'));
const LazyLoginController = React.lazy(() => import('components/login/login_controller'));
const LazyAdminConsole = React.lazy(() => import('components/admin_console'));
const LazyLoggedIn = React.lazy(() => import('components/logged_in'));
const LazyPasswordResetSendLink = React.lazy(() => import('components/password_reset_send_link'));
const LazyPasswordResetForm = React.lazy(() => import('components/password_reset_form'));
const LazySignupController = React.lazy(() => import('components/signup/signup_controller'));
const LazySignupEmail = React.lazy(() => import('components/signup/signup_email'));
const LazyTermsOfService = React.lazy(() => import('components/terms_of_service'));
const LazyShouldVerifyEmail = React.lazy(() => import('components/should_verify_email'));
const LazyDoVerifyEmail = React.lazy(() => import('components/do_verify_email'));
const LazyClaimController = React.lazy(() => import('components/claim'));
const LazyHelpController = React.lazy(() => import('components/help/help_controller'));
const LazyLinkingLandingPage = React.lazy(() => import('components/linking_landing_page'));
const LazySelectTeam = React.lazy(() => import('components/select_team'));
const LazyAuthorize = React.lazy(() => import('components/authorize'));
const LazyCreateTeam = React.lazy(() => import('components/create_team'));
const LazyMfa = React.lazy(() => import('components/mfa/mfa_controller'));

import store from 'stores/redux_store.jsx';
import {getSiteURL} from 'utils/url';
import {enableDevModeFeatures, isDevMode} from 'utils/utils';

import A11yController from 'utils/a11y_controller';

const CreateTeam = makeAsyncComponent(LazyCreateTeam);
const ErrorPage = makeAsyncComponent(LazyErrorPage);
const TermsOfService = makeAsyncComponent(LazyTermsOfService);
const LoginController = makeAsyncComponent(LazyLoginController);
const AdminConsole = makeAsyncComponent(LazyAdminConsole);
const LoggedIn = makeAsyncComponent(LazyLoggedIn);
const PasswordResetSendLink = makeAsyncComponent(LazyPasswordResetSendLink);
const PasswordResetForm = makeAsyncComponent(LazyPasswordResetForm);
const SignupController = makeAsyncComponent(LazySignupController);
const SignupEmail = makeAsyncComponent(LazySignupEmail);
const ShouldVerifyEmail = makeAsyncComponent(LazyShouldVerifyEmail);
const DoVerifyEmail = makeAsyncComponent(LazyDoVerifyEmail);
const ClaimController = makeAsyncComponent(LazyClaimController);
const HelpController = makeAsyncComponent(LazyHelpController);
const LinkingLandingPage = makeAsyncComponent(LazyLinkingLandingPage);
const SelectTeam = makeAsyncComponent(LazySelectTeam);
const Authorize = makeAsyncComponent(LazyAuthorize);
const Mfa = makeAsyncComponent(LazyMfa);

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

export default class Root extends React.PureComponent {
    static propTypes = {
        telemetryEnabled: PropTypes.bool,
        telemetryId: PropTypes.string,
        noAccounts: PropTypes.bool,
        showTermsOfService: PropTypes.bool,
        permalinkRedirectTeamName: PropTypes.string,
        actions: PropTypes.shape({
            loadMeAndConfig: PropTypes.func.isRequired,
        }).isRequired,
        plugins: PropTypes.array,
    }

    constructor(props) {
        super(props);
        this.currentCategoryFocus = 0;
        this.currentSidebarFocus = 0;
        this.mounted = false;

        // Redux
        setUrl(getSiteURL());

        setSystemEmojis(EmojiIndicesByAlias);

        // Force logout of all tabs if one tab is logged out
        window.addEventListener('storage', this.handleLogoutLoginSignal);

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Fastclick
        FastClick.attach(document.body);

        this.state = {
            configLoaded: false,
        };

        // Keyboard navigation for accessibility
        if (!UserAgent.isInternetExplorer()) {
            this.a11yController = new A11yController();
        }
    }

    onConfigLoaded = () => {
        if (isDevMode()) {
            enableDevModeFeatures();
        }

        const telemetryId = this.props.telemetryId;

        let rudderKey = Constants.TELEMETRY_RUDDER_KEY;
        let rudderUrl = Constants.TELEMETRY_RUDDER_DATAPLANE_URL;

        if (rudderKey.startsWith('placeholder') && rudderUrl.startsWith('placeholder')) {
            rudderKey = process.env.RUDDER_KEY; //eslint-disable-line no-process-env
            rudderUrl = process.env.RUDDER_DATAPLANE_URL; //eslint-disable-line no-process-env
        }

        if (rudderKey != null && rudderKey !== '' && this.props.telemetryEnabled) {
            Client4.enableRudderEvents();
            rudderAnalytics.load(rudderKey, rudderUrl);

            rudderAnalytics.identify(telemetryId, {}, {
                context: {
                    ip: '0.0.0.0',
                },
                page: {
                    path: '',
                    referrer: '',
                    search: '',
                    title: '',
                    url: '',
                },
                anonymousId: '00000000000000000000000000',
            });

            rudderAnalytics.page('ApplicationLoaded', {
                path: '',
                referrer: '',
                search: '',
                title: '',
                url: '',
            },
            {
                context: {
                    ip: '0.0.0.0',
                },
                anonymousId: '00000000000000000000000000',
            });
        }

        if (this.props.location.pathname === '/' && this.props.noAccounts) {
            this.props.history.push('/signup_user_complete');
        }

        initializePlugins().then(() => {
            if (this.mounted) {
                // supports enzyme tests, set state if and only if
                // the component is still mounted on screen
                this.setState({configLoaded: true});
            }
        });

        loadRecentlyUsedCustomEmojis()(store.dispatch, store.getState);

        const iosDownloadLink = getConfig(store.getState()).IosAppDownloadLink;
        const androidDownloadLink = getConfig(store.getState()).AndroidAppDownloadLink;

        const toResetPasswordScreen = this.props.location.pathname === '/reset_password_complete';

        // redirect to the mobile landing page if the user hasn't seen it before
        let mobileLanding;
        if (UserAgent.isAndroidWeb()) {
            mobileLanding = androidDownloadLink;
        } else if (UserAgent.isIosWeb()) {
            mobileLanding = iosDownloadLink;
        }

        if (mobileLanding && !BrowserStore.hasSeenLandingPage() && !toResetPasswordScreen && !this.props.location.pathname.includes('/landing')) {
            this.props.history.push('/landing#' + this.props.location.pathname + this.props.location.search);
            BrowserStore.setLandingPageSeen(true);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname === '/') {
            if (this.props.noAccounts) {
                prevProps.history.push('/signup_user_complete');
            } else if (this.props.showTermsOfService) {
                prevProps.history.push('/terms_of_service');
            }
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.props.actions.loadMeAndConfig().then((response) => {
            if (this.props.location.pathname === '/' && response[2] && response[2].data) {
                GlobalActions.redirectUserToDefaultTeam();
            }
            this.onConfigLoaded();
        });
        trackLoadTime();
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('storage', this.handleLogoutLoginSignal);
    }

    handleLogoutLoginSignal = (e) => {
        // when one tab on a browser logs out, it sets __logout__ in localStorage to trigger other tabs to log out
        const isNewLocalStorageEvent = (event) => event.storageArea === localStorage && event.newValue;

        if (e.key === StoragePrefixes.LOGOUT && isNewLocalStorageEvent(e)) {
            console.log('detected logout from a different tab'); //eslint-disable-line no-console
            GlobalActions.emitUserLoggedOutEvent('/', false, false);
        }
        if (e.key === StoragePrefixes.LOGIN && isNewLocalStorageEvent(e)) {
            const isLoggedIn = getCurrentUser(store.getState());

            // make sure this is not the same tab which sent login signal
            // because another tabs will also send login signal after reloading
            if (isLoggedIn) {
                return;
            }

            // detected login from a different tab
            function onVisibilityChange() {
                location.reload();
            }
            document.addEventListener('visibilitychange', onVisibilityChange, false);
        }
    }

    render() {
        if (!this.state.configLoaded) {
            return <div/>;
        }

        return (
            <IntlProvider>
                <Switch>
                    <Route
                        path={'/error'}
                        component={ErrorPage}
                    />
                    <HFTRoute
                        path={'/login'}
                        component={LoginController}
                    />
                    <HFTRoute
                        path={'/reset_password'}
                        component={PasswordResetSendLink}
                    />
                    <HFTRoute
                        path={'/reset_password_complete'}
                        component={PasswordResetForm}
                    />
                    <HFTRoute
                        path={'/signup_user_complete'}
                        component={SignupController}
                    />
                    <HFTRoute
                        path={'/signup_email'}
                        component={SignupEmail}
                    />
                    <HFTRoute
                        path={'/should_verify_email'}
                        component={ShouldVerifyEmail}
                    />
                    <HFTRoute
                        path={'/do_verify_email'}
                        component={DoVerifyEmail}
                    />
                    <HFTRoute
                        path={'/claim'}
                        component={ClaimController}
                    />
                    <HFTRoute
                        path={'/help'}
                        component={HelpController}
                    />
                    <LoggedInRoute
                        path={'/terms_of_service'}
                        component={TermsOfService}
                    />
                    <Route
                        path={'/landing'}
                        component={LinkingLandingPage}
                    />
                    <LoggedInRoute
                        path={'/admin_console'}
                        component={AdminConsole}
                    />
                    <LoggedInHFTRoute
                        path={'/select_team'}
                        component={SelectTeam}
                    />
                    <LoggedInHFTRoute
                        path={'/oauth/authorize'}
                        component={Authorize}
                    />
                    <LoggedInHFTRoute
                        path={'/create_team'}
                        component={CreateTeam}
                    />
                    <LoggedInRoute
                        path={'/mfa'}
                        component={Mfa}
                    />
                    <Redirect
                        from={'/_redirect/integrations/:subpath*'}
                        to={`/${this.props.permalinkRedirectTeamName}/integrations/:subpath*`}
                    />
                    <Redirect
                        from={'/_redirect/pl/:postid'}
                        to={`/${this.props.permalinkRedirectTeamName}/pl/:postid`}
                    />
                    {this.props.plugins?.map((plugin) => (
                        <Route
                            key={plugin.id}
                            path={'/plug/' + plugin.route}
                            render={() => (
                                <Pluggable
                                    pluggableName={'CustomRouteComponent'}
                                    pluggableId={plugin.id}
                                />
                            )}
                        />
                    ))}
                    <LoggedInRoute
                        path={'/:team'}
                        component={NeedsTeam}
                    />
                    <Redirect
                        to={{
                            ...this.props.location,
                            pathname: '/login',
                        }}
                    />
                </Switch>
            </IntlProvider>
        );
    }
}
