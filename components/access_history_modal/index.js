// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getUserAudits} from 'mattermost-redux/actions/users';

import AccessHistoryModal from './access_history_modal.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getUserAudits
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(AccessHistoryModal);
