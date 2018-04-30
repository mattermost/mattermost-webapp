// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {testS3Connection} from 'mattermost-redux/actions/admin';

import S3ConnectionTest from './s3_connection_test.jsx';

export default connect(null, mapDispatchToProps)(S3ConnectionTest);

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            testS3Connection,
        }, dispatch),
    };
}

