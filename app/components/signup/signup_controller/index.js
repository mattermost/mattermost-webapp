// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeamInviteInfo} from 'mattermost-redux/actions/teams';

import {getGlobalItem} from 'selectors/storage';
import {removeGlobalItem} from 'actions/storage';
import {addUserToTeamFromInvite} from 'actions/team_actions';

import SignupController from './signup_controller.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);

    const isLicensed = license && license.IsLicensed === 'true';
    const enableOpenServer = config.EnableOpenServer === 'true';
    const noAccounts = config.NoAccounts === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = config.EnableSignUpWithGoogle === 'true';
    const enableSignUpWithOffice365 = config.EnableSignUpWithOffice365 === 'true';
    const enableLDAP = config.EnableLdap === 'true';
    const enableSAML = config.EnableSaml === 'true';
    const samlLoginButtonText = config.SamlLoginButtonText;
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const siteName = config.SiteName;

    let usedBefore;
    if (ownProps.location.search) {
        const params = new URLSearchParams(ownProps.location.search);
        let token = params.get('t');
        if (token == null) {
            token = '';
        }
        usedBefore = getGlobalItem(state, token, null);
    }

    return {
        loggedIn: Boolean(getCurrentUserId(state)),
        isLicensed,
        enableOpenServer,
        noAccounts,
        enableSignUpWithEmail,
        enableSignUpWithGitLab,
        enableSignUpWithGoogle,
        enableSignUpWithOffice365,
        enableLDAP,
        enableSAML,
        samlLoginButtonText,
        ldapLoginFieldName,
        siteName,
        usedBefore,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            removeGlobalItem,
            getTeamInviteInfo,
            addUserToTeamFromInvite,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupController);
