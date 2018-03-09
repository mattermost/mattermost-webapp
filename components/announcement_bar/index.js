// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import AnnouncementBar from './announcement_bar.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const licenseId = license.Id;
    const siteURL = config.SiteURL;
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const bannerText = config.BannerText;
    const allowBannerDismissal = config.AllowBannerDismissal === 'true';
    const enableBanner = config.EnableBanner === 'true';
    const bannerColor = config.BannerColor;
    const bannerTextColor = config.BannerTextColor;
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';

    return {
        isLoggedIn: Boolean(getCurrentUserId(state)),
        licenseId,
        siteURL,
        sendEmailNotifications,
        bannerText,
        allowBannerDismissal,
        enableBanner,
        bannerColor,
        bannerTextColor,
        enableSignUpWithGitLab,
    };
}

export default connect(mapStateToProps)(AnnouncementBar);
