// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {getUser, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';

import {getDirectTeammate} from 'utils/utils.jsx';

import {GlobalState} from 'types/store';

import AuditTable from './audit_table';

function mapStateToProps(state: GlobalState) {
    return {
        currentUser: getCurrentUser(state),
        getUser: (userId: string) => getUser(state, userId),
        getByName: (channelName: string) => getChannelByName(state, channelName),
        getDirectTeammate: (channelId: string) => getDirectTeammate(state, channelId),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getMissingProfilesByIds,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuditTable);
