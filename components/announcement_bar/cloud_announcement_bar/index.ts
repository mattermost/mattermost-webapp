// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import { savePreferences } from "mattermost-redux/actions/preferences";
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import { getMyTeamMember } from 'mattermost-redux/selectors/entities/teams';
import { getStandardAnalytics } from "mattermost-redux/actions/admin";
import { makeGetCategory } from "mattermost-redux/selectors/entities/preferences";

import {GlobalState} from 'types/store';

import CloudAnnouncementBar from './cloud_announcement_bar';
import { getCurrentUser, isCurrentUserSystemAdmin } from 'mattermost-redux/selectors/entities/users';
import { Preferences } from "utils/constants";

type OwnProps = {
    currentTeamId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const getCategory = makeGetCategory();
    return {
      userLimit: getConfig(state).ExperimentalCloudUserLimit,
      analytics: state.entities.admin.analytics,
      userIsAdmin: isCurrentUserSystemAdmin(state),
      currentUser: getCurrentUser(state),
      isCloud: getLicense(state).Cloud === "true",
      preferences: getCategory(state, Preferences.CLOUD_UPGRADE_BANNER),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                savePreferences,
                getStandardAnalytics,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CloudAnnouncementBar);
