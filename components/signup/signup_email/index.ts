// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';
import {ClientConfig} from 'mattermost-redux/types/config';
import {ServerError} from 'mattermost-redux/types/errors';

import {createUser} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeamInviteInfo} from 'mattermost-redux/actions/teams';

import {setGlobalItem} from 'actions/storage';
import {loginById} from 'actions/views/login';
import {getPasswordConfig} from 'utils/utils.jsx';

import SignupEmail from './signup_email.jsx';

import {GlobalState} from '../../../types/store';
import { CLIEngine } from 'eslint';


export type PasswordConfig = {
    minimumLength: number;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
    requireUppercase: boolean;
}


export type Props = {
    location: {search: string};
    enableSignUpWithEmail: boolean;
    siteName: string;
    termsOfServiceLink?: string;
    privacyPolicyLink?: string;
    customDescriptionText?: string;
    passwordConfig?: PasswordConfig;
    hasAccounts: boolean;
    actions: Actions;
};


export type State = {
    loading: boolean;
    inviteId?: string;
    token?: string;
    email?: string;
    teamName?: string;
    noOpenServerError?: boolean;
    isSubmitting?: boolean;
    nameError?: React.ReactNode;
    emailError?: React.ReactNode;
    passwordError?: React.ReactNode;
    serverError?: React.ReactNode;
};


type TeamInviteInfo = {
    display_name: string;
    description: string;
    name: string;
    id: string;
};


export type Actions = {
    createUser: (user: UserProfile, token: string, inviteId: string, redirect: string) => Promise<{data: UserProfile} | {error: ServerError}>;
    loginById: (id: string, password: string, mfaToken?: string) => Promise<{data: boolean} | {error: ServerError}>;
    setGlobalItem: (name: string, value: string) => {data: boolean};
    getTeamInviteInfo: (inviteId: string) => Promise<{data: TeamInviteInfo} | {error: ServerError}>;
};


type ClientConfigPatched = {
    NoAccounts: "true" | "false";
    SiteName: string;
}


type ClientConfigWithNoAccounts = Partial<ClientConfig> & ClientConfigPatched;



function mapStateToProps(state: GlobalState) {
    const config = getConfig(state) as ClientConfigWithNoAccounts;

    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const siteName = config.SiteName;
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
