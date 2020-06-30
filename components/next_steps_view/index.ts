// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import NextStepsView from './next_steps_view';

function mapStateToProps(state: GlobalState) {
    const license = getLicense(state);

    return {
        skuName: license.SkuShortName,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NextStepsView);
