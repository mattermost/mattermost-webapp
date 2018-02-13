// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addOAuthApp} from 'mattermost-redux/actions/integrations';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import AddOAuthApp from './add_oauth_app.jsx';

const mapStateToProps = (state) => ({
    addOAuthAppRequest: state.requests.integrations.addOAuthApp,
    isSystemAdmin: isCurrentUserSystemAdmin(state)
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        addOAuthApp
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddOAuthApp);
