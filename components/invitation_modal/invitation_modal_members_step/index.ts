// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {
    getLicense,
} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import InvitationModalMembersStep from './invitation_modal_members_step';

function mapStateToProps(state: GlobalState) {
    return {
        isCloud: getLicense(state).Cloud === 'true',
    };
}

export default connect(mapStateToProps)(InvitationModalMembersStep);
