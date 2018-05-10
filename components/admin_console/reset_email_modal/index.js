// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import ResetEmailModal from './reset_email_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
    };
}

export default connect(mapStateToProps)(ResetEmailModal);
