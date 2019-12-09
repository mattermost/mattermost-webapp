// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import LinkingLandingPage from './linking_landing_page';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const defaultTheme = getTheme(state);
    const location = window.location.href.replace('/vault#', '');

    return {
        desktopAppLink: config.AppDownloadLink,
        iosAppLink: config.IosAppDownloadLink,
        androidAppLink: config.AndroidAppDownloadLink,
        backgroundColor: defaultTheme.sidebarBg,
        location,
        nativeLocation: location.replace(/^(https|http)/, 'mattermost'),
        siteUrl: config.SiteURL,
    };
}

export default connect(mapStateToProps)(LinkingLandingPage);
