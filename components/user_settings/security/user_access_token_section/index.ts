// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {
    clearUserAccessTokens,
    createUserAccessToken,
    getUserAccessTokensForUser,
    revokeUserAccessToken,
    enableUserAccessToken,
    disableUserAccessToken,
} from 'mattermost-redux/actions/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import UserAccessTokenSection from './user_access_token_section';

type Actions = {
    getUserAccessTokensForUser: (userId: string, page: number, perPage: number) => void;
    createUserAccessToken: (userId: string, description: string) => Promise<{
        data: {token: string; description: string; id: string; is_active: boolean} | null;
        error?: {
            message: string;
        };
    }>;
    revokeUserAccessToken: (tokenId: string) => Promise<{
        data: string;
        error?: {
            message: string;
        };
    }>;
    enableUserAccessToken: (tokenId: string) => Promise<{
        data: string;
        error?: {
            message: string;
        };
    }>;
    disableUserAccessToken: (tokenId: string) => Promise<{
        data: string;
        error?: {
            message: string;
        };
    }>;
    clearUserAccessTokens: () => void;
}

function mapStateToProps(state: GlobalState) {
    return {
        userAccessTokens: state.entities.users.myUserAccessTokens,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getUserAccessTokensForUser,
            createUserAccessToken,
            revokeUserAccessToken,
            enableUserAccessToken,
            disableUserAccessToken,
            clearUserAccessTokens,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAccessTokenSection);
