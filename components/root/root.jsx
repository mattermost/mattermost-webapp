// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
require('perfect-scrollbar/jquery')($);

import PropTypes from 'prop-types';
import React from 'react';
import FastClick from 'fastclick';
import {setUrl} from 'mattermost-redux/actions/general';
import {setSystemEmojis} from 'mattermost-redux/actions/emojis';

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
import IntlProvider from 'components/intl_provider';
import store from 'stores/redux_store.jsx';
import {getSiteURL} from 'utils/url.jsx';
import {enableDevModeFeatures, isDevMode} from 'utils/utils';
import A11yController from 'utils/a11y_controller';

import RootSwitch from './switch';

export default class Root extends React.Component {
    static propTypes = {
        diagnosticsEnabled: PropTypes.bool,
        diagnosticId: PropTypes.string,
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
            completingUserData: false,
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
    }

    componentDidMount() {
        this.props.actions.loadMeAndConfig().then(() => this.onConfigLoaded());
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
                <RootSwitch/>
            </IntlProvider>
        );
    }
}
