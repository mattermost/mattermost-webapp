// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getMyTeamMember, getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {RequestStatus} from 'mattermost-redux/constants';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {Team} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import {addUserToTeamFromInvite} from 'actions/team_actions';
import {login} from 'actions/views/login';

import LoginController from './login_controller';

type Actions = {
    login: (loginId: string, password: string, mfaToken: string) => Promise<{ data: boolean; error: ServerError }>;
    addUserToTeamFromInvite: (token: string, inviteId: string) => Promise<{ data: Team; error: ServerError }>;
}

function mapStateToProps(state: GlobalState) {
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
    const enableSignUpWithOpenId = config.EnableSignUpWithOpenId === 'true';
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const samlLoginButtonText = config.SamlLoginButtonText;
    const openidButtonText = config.OpenIdButtonText;
    const openidButtonColor = config.OpenIdButtonColor;

    const siteName = config.SiteName;
    const initializing = state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized;

    // Only set experimental team if user is on that team
    let experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    if (experimentalPrimaryTeam) {
        const team = getTeamByName(state, experimentalPrimaryTeam);
        if (team) {
            const member = getMyTeamMember(state, team.id);
            if (!member || !member.team_id) {
                experimentalPrimaryTeam = undefined;
            }
        } else {
            experimentalPrimaryTeam = undefined;
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
        enableSignUpWithOpenId,
        experimentalPrimaryTeam,
        ldapLoginFieldName,
        samlLoginButtonText,
        openidButtonText,
        openidButtonColor,
        siteName,
        initializing,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            login,
            addUserToTeamFromInvite,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginController);
