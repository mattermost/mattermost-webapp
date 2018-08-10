// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig, updateConfig} from 'mattermost-redux/actions/admin';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';

import EditPostTimeLimitModal from './edit_post_time_limit_modal';

function mapStateToProps(state) {
    return {
        config: Selectors.getConfig(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateConfig,
            getConfig,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPostTimeLimitModal);
