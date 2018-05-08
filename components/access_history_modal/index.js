// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getUserAudits} from 'mattermost-redux/actions/users';

import AccessHistoryModal from './access_history_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUserAudits,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccessHistoryModal);
