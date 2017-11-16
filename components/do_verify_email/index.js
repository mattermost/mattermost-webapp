// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {verifyUserEmail} from 'mattermost-redux/actions/users';

import DoVerifyEmail from './do_verify_email.jsx';

const mapStateToProps = createSelector(
    () => {
        return {};
    }
);

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            verifyUserEmail: bindActionCreators(verifyUserEmail, dispatch)
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DoVerifyEmail);
