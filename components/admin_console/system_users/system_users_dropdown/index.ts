// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {Error} from 'mattermost-redux/types/errors';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {updateUserActive, revokeAllSessionsForUser, promoteGuestToUser, demoteUserToGuest} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';
import {loadBots} from 'mattermost-redux/actions/bots';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import * as Selectors from 'mattermost-redux/selectors/entities/admin';

import {GlobalState} from 'types/store';

import SystemUsersDropdown from './system_users_dropdown';

type Actions = {
    updateUserActive: (id: string, active: boolean) => Promise<{error: Error}>;
    revokeAllSessionsForUser: (id: string) => Promise<{error: Error; data: any}>;
    promoteGuestToUser: (id: string) => Promise<{error: Error}>;
    demoteUserToGuest: (id: string) => Promise<{error: Error}>;
    loadBots: (page?: number, size?: number) => Promise<{}>;
}

function mapStateToProps(state: GlobalState) {
    const bots = getBotAccounts(state);
    const license = getLicense(state);
    return {
        isLicensed: license && license.IsLicensed === 'true',
        config: Selectors.getConfig(state),
        currentUser: getCurrentUser(state),
        bots,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            updateUserActive,
            revokeAllSessionsForUser,
            promoteGuestToUser,
            demoteUserToGuest,
            loadBots,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsersDropdown);
