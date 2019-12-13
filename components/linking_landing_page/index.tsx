// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import LinkingLandingPage from './linking_landing_page';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        desktopAppLink: config.AppDownloadLink,
        iosAppLink: config.IosAppDownloadLink,
        androidAppLink: config.AndroidAppDownloadLink,
        defaultTheme: getTheme(state),
        siteUrl: config.SiteURL,
        siteName: config.SiteName,
    };
}

export default connect(mapStateToProps)(LinkingLandingPage);
