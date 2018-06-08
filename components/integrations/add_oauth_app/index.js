// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addOAuthApp} from 'mattermost-redux/actions/integrations';

import AddOAuthApp from './add_oauth_app.jsx';

function mapStateToProps(state) {
    return {
        addOAuthAppRequest: state.requests.integrations.addOAuthApp,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addOAuthApp,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddOAuthApp);
