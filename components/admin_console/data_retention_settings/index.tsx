// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';

import {GlobalState} from 'types/store';

import DataRetentionSettings from './data_retention_settings';

function mapStateToProps(state: GlobalState) {
    return {};
}

export default connect(mapStateToProps)(DataRetentionSettings);
