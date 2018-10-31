// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getCurrentUserId, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import AnnouncementBar from './announcement_bar.jsx';

function mapStateToProps(state) {
    const canViewSystemErrors = haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM});
    const canViewAPIv3Banner = haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM});
    const license = getLicense(state);
    const config = getConfig(state);
    const user = getCurrentUser(state);
    const siteURL = config.SiteURL;
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const enablePreviewMode = config.EnablePreviewModeBanner === 'true';
    const bannerText = config.BannerText;
    const allowBannerDismissal = config.AllowBannerDismissal === 'true';
    const enableBanner = config.EnableBanner === 'true';
    const bannerColor = config.BannerColor;
    const bannerTextColor = config.BannerTextColor;
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    return {
        isLoggedIn: Boolean(getCurrentUserId(state)),
        canViewSystemErrors,
        user,
        canViewAPIv3Banner,
        license,
        siteURL,
        sendEmailNotifications,
        requireEmailVerification,
        bannerText,
        allowBannerDismissal,
        enableBanner,
        enablePreviewMode,
        bannerColor,
        bannerTextColor,
        enableSignUpWithGitLab,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            sendVerificationEmail,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnouncementBar);
