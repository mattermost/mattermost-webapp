// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {
    getMe,
    updateMe,
    sendVerificationEmail,
    setDefaultProfileImage,
    uploadProfileImage,
} from 'mattermost-redux/actions/users';
import {clearErrors, logError} from 'mattermost-redux/actions/errors';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import UserSettingsGeneralTab from './user_settings_general';

type Actions = {
    logError: ({message, type}: {message: any; type: string}, status: boolean) => void;
    clearErrors: () => void;
    getMe: () => void;
    updateMe: (user: UserProfile) => Promise<{
        data: boolean;
        error?: {
            server_error_id: string;
            message: string;
        };
    }>;
    sendVerificationEmail: (email: string) => Promise<{
        data: boolean;
        error?: {
            err: string;
        };
    }>;
    setDefaultProfileImage: (id: string) => void;
    uploadProfileImage: (id: string, file: object) => Promise<{
        data: boolean;
        error?: {
            message: string;
        };
    }>;
}

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const maxFileSize = parseInt(config.MaxFileSize!, 10);
    const ldapFirstNameAttributeSet = config.LdapFirstNameAttributeSet === 'true';
    const ldapLastNameAttributeSet = config.LdapLastNameAttributeSet === 'true';
    const samlFirstNameAttributeSet = config.SamlFirstNameAttributeSet === 'true';
    const samlLastNameAttributeSet = config.SamlLastNameAttributeSet === 'true';
    const ldapNicknameAttributeSet = config.LdapNicknameAttributeSet === 'true';
    const samlNicknameAttributeSet = config.SamlNicknameAttributeSet === 'true';
    const samlPositionAttributeSet = config.SamlPositionAttributeSet === 'true';
    const ldapPositionAttributeSet = config.LdapPositionAttributeSet === 'true';

    return {
        requireEmailVerification,
        maxFileSize,
        ldapFirstNameAttributeSet,
        ldapLastNameAttributeSet,
        samlFirstNameAttributeSet,
        samlLastNameAttributeSet,
        ldapNicknameAttributeSet,
        samlNicknameAttributeSet,
        samlPositionAttributeSet,
        ldapPositionAttributeSet,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>,
        Actions>({
            logError,
            clearErrors,
            getMe,
            updateMe,
            sendVerificationEmail,
            setDefaultProfileImage,
            uploadProfileImage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsGeneralTab);
