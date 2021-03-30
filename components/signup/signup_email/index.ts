// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {createUser} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeamInviteInfo} from 'mattermost-redux/actions/teams';

import {setGlobalItem} from 'actions/storage';
import {loginById} from 'actions/views/login';
import {getPasswordConfig} from 'utils/utils.jsx';

import {GlobalState} from '../../../types/store';

import SignupEmail, {Props, State, Actions} from './signup_email';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const siteName = config.SiteName || '';
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customDescriptionText = config.CustomDescriptionText;
    const hasAccounts = config.NoAccounts === 'false';

    return {
        enableSignUpWithEmail,
        siteName,
        termsOfServiceLink,
        privacyPolicyLink,
        customDescriptionText,
        passwordConfig: getPasswordConfig(config),
        hasAccounts,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            createUser,
            loginById,
            setGlobalItem,
            getTeamInviteInfo,
        }, dispatch),
    };
}

/* This is a workaround to handle the issue of Typescript not being able to correctly infer the types of the component's Props */
export default connect(mapStateToProps, mapDispatchToProps)(SignupEmail as React.ComponentClass<Props, State>);
