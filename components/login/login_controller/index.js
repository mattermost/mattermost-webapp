// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getTeamByName, getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {RequestStatus} from 'mattermost-redux/constants';

import {addUserToTeamFromInvite} from 'actions/team_actions';

import {login} from 'actions/views/login';

import LoginController from './login_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const isLicensed = license.IsLicensed === 'true';

    const customBrandText = config.CustomBrandText;
    const customDescriptionText = config.CustomDescriptionText;
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const enableLdap = config.EnableLdap === 'true';
    const enableOpenServer = config.EnableOpenServer === 'true';
    const enableSaml = config.EnableSaml === 'true';
    const enableSignInWithEmail = config.EnableSignInWithEmail === 'true';
    const enableSignInWithUsername = config.EnableSignInWithUsername === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = config.EnableSignUpWithGoogle === 'true';
    const enableSignUpWithOffice365 = config.EnableSignUpWithOffice365 === 'true';
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const samlLoginButtonText = config.SamlLoginButtonText;
    const siteName = config.SiteName;
    const initializing = state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized;

    // Only set experimental team if user is on that team
    let experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    if (experimentalPrimaryTeam) {
        const team = getTeamByName(state, experimentalPrimaryTeam);
        if (team) {
            const member = getMyTeamMember(state, team.id);
            if (!member || !member.team_id) {
                experimentalPrimaryTeam = null;
            }
        } else {
            experimentalPrimaryTeam = null;
        }
    }

    return {
        currentUser: getCurrentUser(state),
        isLicensed,
        customBrandText,
        customDescriptionText,
        enableCustomBrand,
        enableLdap,
        enableOpenServer,
        enableSaml,
        enableSignInWithEmail,
        enableSignInWithUsername,
        enableSignUpWithEmail,
        enableSignUpWithGitLab,
        enableSignUpWithGoogle,
        enableSignUpWithOffice365,
        experimentalPrimaryTeam,
        ldapLoginFieldName,
        samlLoginButtonText,
        siteName,
        initializing,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            login,
            addUserToTeamFromInvite,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginController);
