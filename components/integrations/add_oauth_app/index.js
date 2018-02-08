// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addOAuthApp} from 'mattermost-redux/actions/integrations';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import AddOAuthApp from './add_oauth_app.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        addOAuthAppRequest: state.requests.integrations.addOAuthApp,
        isSystemAdmin: isCurrentUserSystemAdmin(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addOAuthApp
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddOAuthApp);
