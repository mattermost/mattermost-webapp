// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createOutgoingHook} from 'mattermost-redux/actions/integrations';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import AddOutgoingWebhook from './add_outgoing_webhook.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';
    return {
        enablePostUsernameOverride,
        enablePostIconOverride,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            createOutgoingHook,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddOutgoingWebhook);
