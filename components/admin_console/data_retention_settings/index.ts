// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {getCustomDataRetentionPolicies} from 'mattermost-redux/actions/general';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import DataRetentionSettings from './data_retention_settings';

type Actions = {
    getCustomDataRetentionPolicies: () => Promise<{ data: {policies: []} }>;
};

function mapStateToProps(state: GlobalState) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getCustomDataRetentionPolicies,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataRetentionSettings);
