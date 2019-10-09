// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
require('perfect-scrollbar/jquery')($);

import PropTypes from 'prop-types';
import React from 'react';
import FastClick from 'fastclick';
import {Route, Switch, Redirect} from 'react-router-dom';
import {setUrl} from 'mattermost-redux/actions/general';
import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import * as UserAgent from 'utils/user_agent.jsx';
import {EmojiIndicesByAlias} from 'utils/emoji.jsx';
import {trackLoadTime} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import {loadRecentlyUsedCustomEmojis} from 'actions/emoji_actions.jsx';
import * as I18n from 'i18n/i18n.jsx';
import {initializePlugins} from 'plugins';
import 'plugins/export.js';
import Constants, {StoragePrefixes} from 'utils/constants.jsx';
import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import IntlProvider from 'components/intl_provider';
import NeedsTeam from 'components/needs_team';
import PermalinkRedirector from 'components/permalink_redirector';
import store from 'stores/redux_store.jsx';
import {getSiteURL} from 'utils/url';
import {enableDevModeFeatures, isDevMode} from 'utils/utils';
import A11yController from 'utils/a11y_controller';

const ErrorPage = React.lazy(() => import('components/error_page'));
const LoginController = React.lazy(() => import('components/login/login_controller'));
const AdminConsole = React.lazy(() => import('components/admin_console'));
const LoggedIn = React.lazy(() => import('components/logged_in'));
const PasswordResetSendLink = React.lazy(() => import('components/password_reset_send_link'));
const PasswordResetForm = React.lazy(() => import('components/password_reset_form'));
const SignupController = React.lazy(() => import('components/signup/signup_controller'));
const SignupEmail = React.lazy(() => import('components/signup/signup_email'));
const TermsOfService = React.lazy(() => import('components/terms_of_service'));
const ShouldVerifyEmail = React.lazy(() => import('components/should_verify_email'));
const DoVerifyEmail = React.lazy(() => import('components/do_verify_email'));
const ClaimController = React.lazy(() => import('components/claim'));
const HelpController = React.lazy(() => import('components/help/help_controller'));
const GetIosApp = React.lazy(() => import('components/get_ios_app'));
const GetAndroidApp = React.lazy(() => import('components/get_android_app'));
const SelectTeam = React.lazy(() => import('components/select_team'));
const Authorize = React.lazy(() => import('components/authorize'));
const CreateTeam = React.lazy(() => import('components/create_team'));
const Mfa = React.lazy(() => import('components/mfa/mfa_controller'));

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

export default class Root extends React.Component {
    static propTypes = {
        diagnosticsEnabled: PropTypes.bool,
        diagnosticId: PropTypes.string,
        noAccounts: PropTypes.bool,
        showTermsOfService: PropTypes.bool,
        actions: PropTypes.shape({
            loadMeAndConfig: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.currentCategoryFocus = 0;
        this.currentSidebarFocus = 0;

        // Redux
        setUrl(getSiteURL());

        setSystemEmojis(EmojiIndicesByAlias);

        // Force logout of all tabs if one tab is logged out
        $(window).bind('storage', (e) => {
            // when one tab on a browser logs out, it sets __logout__ in localStorage to trigger other tabs to log out
            if (e.originalEvent.key === StoragePrefixes.LOGOUT && e.originalEvent.storageArea === localStorage && e.originalEvent.newValue) {
                // make sure it isn't this tab that is sending the logout signal (only necessary for IE11)
                if (BrowserStore.isSignallingLogout(e.originalEvent.newValue)) {
                    return;
                }

                console.log('detected logout from a different tab'); //eslint-disable-line no-console
                GlobalActions.emitUserLoggedOutEvent('/', false, false);
            }

            if (e.originalEvent.key === StoragePrefixes.LOGIN && e.originalEvent.storageArea === localStorage && e.originalEvent.newValue) {
                // make sure it isn't this tab that is sending the logout signal (only necessary for IE11)
                if (BrowserStore.isSignallingLogin(e.originalEvent.newValue)) {
                    return;
                }

                console.log('detected login from a different tab'); //eslint-disable-line no-console
                location.reload();
            }
        });

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

        const segmentKey = Constants.DIAGNOSTICS_SEGMENT_KEY;
        const diagnosticId = this.props.diagnosticId;

        /*eslint-disable */
        if (segmentKey != null && segmentKey !== '' && !segmentKey.startsWith('placeholder') && this.props.diagnosticsEnabled) {
            !function(){var analytics=global.window.analytics=global.window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(...args){var e=Array.prototype.slice.call(args);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol ? "https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.0.1";
                analytics.load(segmentKey);

                analytics.identify(diagnosticId, {}, {
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

                analytics.page('ApplicationLoaded', {
                        path: '',
                        referrer: '',
                        search: '',
                        title: '',
                        url: '',
                    },
                    {
                        context: {
                            ip: '0.0.0.0'
                        },
                        anonymousId: '00000000000000000000000000'
                    });
            }}();
        }
        /*eslint-enable */

        const afterIntl = () => {
            if (this.props.location.pathname === '/' && this.props.noAccounts) {
                this.props.history.push('/signup_user_complete');
            }

            initializePlugins().then(() => {
                this.setState({configLoaded: true});
            });
        };
        if (global.Intl) {
            afterIntl();
        } else {
            I18n.safariFix(afterIntl);
        }

        loadRecentlyUsedCustomEmojis()(store.dispatch, store.getState);

        const iosDownloadLink = getConfig(store.getState()).IosAppDownloadLink;
        const androidDownloadLink = getConfig(store.getState()).AndroidAppDownloadLink;

        const toResetPasswordScreen = this.props.location.pathname === '/reset_password_complete';

        // redirect to the mobile landing page if the user hasn't seen it before
        if (iosDownloadLink && UserAgent.isIosWeb() && !BrowserStore.hasSeenLandingPage() && !toResetPasswordScreen) {
            this.props.history.push('/get_ios_app?redirect_to=' + encodeURIComponent(this.props.location.pathname) + encodeURIComponent(this.props.location.search));
            BrowserStore.setLandingPageSeen(true);
        } else if (androidDownloadLink && UserAgent.isAndroidWeb() && !BrowserStore.hasSeenLandingPage() && !toResetPasswordScreen) {
            this.props.history.push('/get_android_app?redirect_to=' + encodeURIComponent(this.props.location.pathname) + encodeURIComponent(this.props.location.search));
            BrowserStore.setLandingPageSeen(true);
        }
    }

    redirectIfNecessary = (props) => {
        if (props.location.pathname === '/') {
            if (this.props.noAccounts) {
                this.props.history.push('/signup_user_complete');
            } else if (props.showTermsOfService) {
                this.props.history.push('/terms_of_service');
            }
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) { // eslint-disable-line camelcase
        this.redirectIfNecessary(newProps);
    }

    componentDidMount() {
        this.props.actions.loadMeAndConfig().then((response) => {
            if (this.props.location.pathname === '/' && response[2] && response[2].data) {
                GlobalActions.redirectUserToDefaultTeam();
            }
            this.onConfigLoaded();
        });
        trackLoadTime();
    }

    componentWillUnmount() {
        $(window).unbind('storage');
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
                        path={'/get_ios_app'}
                        component={GetIosApp}
                    />
                    <Route
                        path={'/get_android_app'}
                        component={GetAndroidApp}
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
                    <LoggedInRoute
                        path={['/_redirect/integrations*', '/_redirect/pl/:postid']}
                        component={PermalinkRedirector}
                    />
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
