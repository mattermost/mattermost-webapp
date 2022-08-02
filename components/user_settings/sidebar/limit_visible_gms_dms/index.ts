// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import LimitVisibleGMsDMs from './limit_visible_gms_dms';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
        dmGmLimit: getInt(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.LIMIT_VISIBLE_DMS_GMS, 20),
    };
}

const mapDispatchToProps = {
    savePreferences,
};

export default connect(mapStateToProps, mapDispatchToProps)(LimitVisibleGMsDMs);
