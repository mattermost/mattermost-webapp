// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import deepEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import throttle from 'lodash/throttle';

import classNames from 'classnames';

import {rudderAnalytics, RudderTelemetryHandler} from 'mattermost-redux/client/rudder';
import {Client4} from 'mattermost-redux/client';
import {setUrl} from 'mattermost-redux/actions/general';
import {General} from 'mattermost-redux/constants';
import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser, isCurrentUserSystemAdmin, checkIsFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';

import {loadRecentlyUsedCustomEmojis} from 'actions/emoji_actions';
import * as GlobalActions from 'actions/global_actions';
import {measurePageLoadTelemetry, trackSelectorMetrics} from 'actions/telemetry_actions.jsx';

import {makeAsyncComponent} from 'components/async_load';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import GlobalHeader from 'components/global_header/global_header';
import ModalController from 'components/modal_controller';
import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import IntlProvider from 'components/intl_provider';
import NeedsTeam from 'components/needs_team';
import OnBoardingTaskList from 'components/onboarding_tasklist';
import LaunchingWorkspace, {LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX} from 'components/preparing_workspace/launching_workspace';
import {Animations} from 'components/preparing_workspace/steps';

import {initializePlugins} from 'plugins';
import 'plugins/export.js';
import Pluggable from 'plugins/pluggable';
import BrowserStore from 'stores/browser_store';
import Constants, {StoragePrefixes, WindowSizes} from 'utils/constants';
import {EmojiIndicesByAlias} from 'utils/emoji.jsx';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import webSocketClient from 'client/web_websocket_client.jsx';

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
const LazyPreparingWorkspace = React.lazy(() => import('components/preparing_workspace'));

import store from 'stores/redux_store.jsx';
import {getSiteURL} from 'utils/url';
import A11yController from 'utils/a11y_controller';
import TeamSidebar from 'components/team_sidebar';

import {applyLuxonDefaults} from './effects';

import RootRedirect from './root_redirect';

const CreateTeam = makeAsyncComponent('CreateTeam', LazyCreateTeam);
const ErrorPage = makeAsyncComponent('ErrorPage', LazyErrorPage);
const TermsOfService = makeAsyncComponent('TermsOfService', LazyTermsOfService);
const LoginController = makeAsyncComponent('LoginController', LazyLoginController);
const AdminConsole = makeAsyncComponent('AdminConsole', LazyAdminConsole);
const LoggedIn = makeAsyncComponent('LoggedIn', LazyLoggedIn);
const PasswordResetSendLink = makeAsyncComponent('PasswordResedSendLink', LazyPasswordResetSendLink);
const PasswordResetForm = makeAsyncComponent('PasswordResetForm', LazyPasswordResetForm);
const SignupController = makeAsyncComponent('SignupController', LazySignupController);
const SignupEmail = makeAsyncComponent('SignupEmail', LazySignupEmail);
const ShouldVerifyEmail = makeAsyncComponent('ShouldVerifyEmail', LazyShouldVerifyEmail);
const DoVerifyEmail = makeAsyncComponent('DoVerifyEmail', LazyDoVerifyEmail);
const ClaimController = makeAsyncComponent('ClaimController', LazyClaimController);
const HelpController = makeAsyncComponent('HelpController', LazyHelpController);
const LinkingLandingPage = makeAsyncComponent('LinkingLandingPage', LazyLinkingLandingPage);
const SelectTeam = makeAsyncComponent('SelectTeam', LazySelectTeam);
const Authorize = makeAsyncComponent('Authorize', LazyAuthorize);
const Mfa = makeAsyncComponent('Mfa', LazyMfa);
const PreparingWorkspace = makeAsyncComponent('PreparingWorkspace', LazyPreparingWorkspace);

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

const noop = () => {}; // eslint-disable-line no-empty-function

export default class Root extends React.PureComponent {
    static propTypes = {
        theme: PropTypes.object,
        telemetryEnabled: PropTypes.bool,
        telemetryId: PropTypes.string,
        noAccounts: PropTypes.bool,
        showTermsOfService: PropTypes.bool,
        permalinkRedirectTeamName: PropTypes.string,
        actions: PropTypes.shape({
            loadMeAndConfig: PropTypes.func.isRequired,
            emitBrowserWindowResized: PropTypes.func.isRequired,
            getFirstAdminSetupComplete: PropTypes.func.isRequired,
            getProfiles: PropTypes.func.isRequired,
        }).isRequired,
        plugins: PropTypes.array,
        products: PropTypes.array,
        showTaskList: PropTypes.bool,
        showLaunchingWorkspace: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        this.currentCategoryFocus = 0;
        this.currentSidebarFocus = 0;
        this.mounted = false;

        // Redux
        setUrl(getSiteURL());

        // Disable auth header to enable CSRF check
        Client4.setAuthHeader = false;

        setSystemEmojis(EmojiIndicesByAlias);

        // Force logout of all tabs if one tab is logged out
        window.addEventListener('storage', this.handleLogoutLoginSignal);

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', (e) => {
            if (e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind === 'file') {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        document.addEventListener('dragover', (e) => {
            if (!document.body.classList.contains('focalboard-body')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.state = {
            configLoaded: false,
        };

        // Keyboard navigation for accessibility
        if (!UserAgent.isInternetExplorer()) {
            this.a11yController = new A11yController();
        }

        // set initial window size state
        this.desktopMediaQuery = window.matchMedia(`(min-width: ${Constants.DESKTOP_SCREEN_WIDTH + 1}px)`);
        this.smallDesktopMediaQuery = window.matchMedia(`(min-width: ${Constants.TABLET_SCREEN_WIDTH + 1}px) and (max-width: ${Constants.DESKTOP_SCREEN_WIDTH}px)`);
        this.tabletMediaQuery = window.matchMedia(`(min-width: ${Constants.MOBILE_SCREEN_WIDTH + 1}px) and (max-width: ${Constants.TABLET_SCREEN_WIDTH}px)`);
        this.mobileMediaQuery = window.matchMedia(`(max-width: ${Constants.MOBILE_SCREEN_WIDTH}px)`);

        this.updateWindowSize();

        store.subscribe(() => applyLuxonDefaults(store.getState()));
    }

    onConfigLoaded = () => {
        const telemetryId = this.props.telemetryId;

        let rudderKey = Constants.TELEMETRY_RUDDER_KEY;
        let rudderUrl = Constants.TELEMETRY_RUDDER_DATAPLANE_URL;

        if (rudderKey.startsWith('placeholder') && rudderUrl.startsWith('placeholder')) {
            rudderKey = process.env.RUDDER_KEY; //eslint-disable-line no-process-env
            rudderUrl = process.env.RUDDER_DATAPLANE_URL; //eslint-disable-line no-process-env
        }

        if (rudderKey != null && rudderKey !== '' && this.props.telemetryEnabled) {
            const rudderCfg = {};
            const siteURL = getConfig(store.getState()).SiteURL;
            if (siteURL !== '') {
                try {
                    rudderCfg.setCookieDomain = new URL(siteURL).hostname;
                    // eslint-disable-next-line no-empty
                } catch (_) {}
            }
            rudderAnalytics.load(rudderKey, rudderUrl, rudderCfg);

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

            rudderAnalytics.ready(() => {
                Client4.setTelemetryHandler(new RudderTelemetryHandler());
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

        Utils.applyTheme(this.props.theme);
    }

    componentDidUpdate(prevProps) {
        if (!deepEqual(prevProps.theme, this.props.theme)) {
            Utils.applyTheme(this.props.theme);
        }
        if (this.props.location.pathname === '/') {
            if (this.props.noAccounts) {
                prevProps.history.push('/signup_user_complete');
            } else if (this.props.showTermsOfService) {
                prevProps.history.push('/terms_of_service');
            }
        }
    }

    async redirectToOnboardingOrDefaultTeam() {
        const storeState = store.getState();
        const isUserAdmin = isCurrentUserSystemAdmin(storeState);
        if (!isUserAdmin) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const useCaseOnboarding = getUseCaseOnboarding(storeState);
        if (!useCaseOnboarding) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const firstAdminSetupComplete = await this.props.actions.getFirstAdminSetupComplete();
        if (firstAdminSetupComplete?.data) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const profilesResult = await this.props.actions.getProfiles(0, General.PROFILE_CHUNK_SIZE, {roles: General.SYSTEM_ADMIN_ROLE});
        if (profilesResult.error) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }
        const currentUser = getCurrentUser(store.getState());
        const adminProfiles = profilesResult.data.reduce(
            (acc, curr) => {
                acc[curr.id] = curr;
                return acc;
            },
            {},
        );
        if (checkIsFirstAdmin(currentUser, adminProfiles)) {
            this.props.history.push('/preparing-workspace');
            return;
        }

        GlobalActions.redirectUserToDefaultTeam();
    }

    componentDidMount() {
        this.mounted = true;
        this.props.actions.loadMeAndConfig().then((response) => {
            const successfullyLoadedMe = response[2] && response[2].data;
            if (this.props.location.pathname === '/' && successfullyLoadedMe) {
                this.redirectToOnboardingOrDefaultTeam();
            }
            this.onConfigLoaded();
        });

        measurePageLoadTelemetry();
        trackSelectorMetrics();

        if (this.desktopMediaQuery.addEventListener) {
            this.desktopMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
        } else if (this.desktopMediaQuery.addListener) {
            this.desktopMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.addListener(this.handleMediaQueryChangeEvent);
        } else {
            window.addEventListener('resize', this.handleWindowResizeEvent);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('storage', this.handleLogoutLoginSignal);

        if (this.desktopMediaQuery.removeEventListener) {
            this.desktopMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
        } else if (this.desktopMediaQuery.removeListener) {
            this.desktopMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
        } else {
            window.removeEventListener('resize', this.handleWindowResizeEvent);
        }
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

    handleWindowResizeEvent = throttle(() => {
        this.props.actions.emitBrowserWindowResized();
    }, 100);

    handleMediaQueryChangeEvent = (e) => {
        if (e.matches) {
            this.updateWindowSize();
        }
    }

    updateWindowSize = () => {
        switch (true) {
        case this.desktopMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.DESKTOP_VIEW);
            break;
        case this.smallDesktopMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.SMALL_DESKTOP_VIEW);
            break;
        case this.tabletMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.TABLET_VIEW);
            break;
        case this.mobileMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.MOBILE_VIEW);
            break;
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
                    <Route
                        path={'/admin_console'}
                    >
                        <>
                            <Switch>
                                <LoggedInRoute
                                    path={'/admin_console'}
                                    component={AdminConsole}
                                />
                                <RootRedirect/>
                            </Switch>
                            <CompassThemeProvider theme={this.props.theme}>
                                {this.props.showTaskList && <OnBoardingTaskList/>}
                            </CompassThemeProvider>
                        </>
                    </Route>
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
                    <LoggedInRoute
                        path={'/preparing-workspace'}
                        component={PreparingWorkspace}
                    />
                    <Redirect
                        from={'/_redirect/integrations/:subpath*'}
                        to={`/${this.props.permalinkRedirectTeamName}/integrations/:subpath*`}
                    />
                    <Redirect
                        from={'/_redirect/pl/:postid'}
                        to={`/${this.props.permalinkRedirectTeamName}/pl/:postid`}
                    />
                    <CompassThemeProvider theme={this.props.theme}>
                        {(this.props.showLaunchingWorkspace && !this.props.location.pathname.includes('/preparing-workspace') &&
                            <LaunchingWorkspace
                                fullscreen={true}
                                zIndex={LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX}
                                show={true}
                                onPageView={noop}
                                transitionDirection={Animations.Reasons.EnterFromBefore}
                            />
                        )}
                        <ModalController/>
                        <GlobalHeader/>
                        {this.props.showTaskList && <OnBoardingTaskList/>}
                        <TeamSidebar/>
                        <Switch>
                            {this.props.products?.map((product) => (
                                <Route
                                    key={product.id}
                                    path={product.baseURL}
                                    render={(props) => (
                                        <LoggedIn {...props}>
                                            <div className={classNames(['product-wrapper', {wide: !product.showTeamSidebar}])}>
                                                <Pluggable
                                                    pluggableName={'Product'}
                                                    subComponentName={'mainComponent'}
                                                    pluggableId={product.id}
                                                    webSocketClient={webSocketClient}
                                                />
                                            </div>
                                        </LoggedIn>
                                    )}
                                />
                            ))}
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
                            <RootRedirect/>
                        </Switch>
                        <Pluggable pluggableName='Global'/>
                    </CompassThemeProvider>
                </Switch>
            </IntlProvider>
        );
    }
}
