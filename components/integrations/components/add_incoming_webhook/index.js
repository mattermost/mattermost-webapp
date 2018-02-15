// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createIncomingHook} from 'mattermost-redux/actions/integrations';

import AddIncomingWebhook from './add_incoming_webhook.jsx';

const mapStateToProps = (state) => {
    const config = state.entities.general.config;
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    return {
        createIncomingHookRequest: state.requests.integrations.createIncomingHook,
        enablePostUsernameOverride,
        enablePostIconOverride
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        createIncomingHook
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddIncomingWebhook);
