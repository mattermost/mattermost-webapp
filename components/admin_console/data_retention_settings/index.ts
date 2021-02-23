// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {getDataRetentionCustomPolicies as fetchDataRetentionCustomPolicies} from 'mattermost-redux/actions/admin';
import {getDataRetentionCustomPolicies} from 'mattermost-redux/selectors/entities/admin';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {DataRetentionCustomPolicies} from 'mattermost-redux/types/data_retention';

import {GlobalState} from 'types/store';

import DataRetentionSettings from './data_retention_settings';

type Actions = {
    getDataRetentionCustomPolicies: () => Promise<{ data: DataRetentionCustomPolicies}>;
};

function mapStateToProps(state: GlobalState) {
    const customPolicies = getDataRetentionCustomPolicies(state);
    return {
        customPolicies
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicies: fetchDataRetentionCustomPolicies,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataRetentionSettings);
