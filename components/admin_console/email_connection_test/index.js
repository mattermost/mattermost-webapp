// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {testEmail} from 'mattermost-redux/actions/admin';

import EmailConnectionTestButton from './email_connection_test.jsx';

export default connect(null, mapDispatchToProps)(EmailConnectionTestButton);

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            testEmail,
        }, dispatch),
    };
}
