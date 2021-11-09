// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { getProfiles, getUserStatuses } from 'mattermost-redux/selectors/entities/users';
import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import CreateUserGroupsModal from './create_user_groups_modal';


function makeMapStateToProps() {
    return (state: GlobalState) => {
        const profiles = getProfiles(state, {active: true});

        const userStatuses = getUserStatuses(state);

        return {
            profiles,
            userStatuses,
        };
    };
}

export default connect(makeMapStateToProps)(CreateUserGroupsModal);
