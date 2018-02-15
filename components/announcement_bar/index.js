// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import AnnouncementBar from './announcement_bar.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

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
        ...ownProps,
        isLoggedIn: Boolean(getCurrentUserId(state)),
        licenseId,
        siteURL,
        sendEmailNotifications,
        bannerText,
        allowBannerDismissal,
        enableBanner,
        bannerColor,
        bannerTextColor,
        enableSignUpWithGitLab
    };
}

export default connect(mapStateToProps)(AnnouncementBar);
