// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getOutgoingHook, updateOutgoingHook} from 'mattermost-redux/actions/integrations';

import EditOutgoingWebhook from './edit_outgoing_webhook.jsx';

const mapStateToProps = (state, ownProps) => {
    const hookId = (new URLSearchParams(ownProps.location.search)).get('id');

    return {
        hookId,
        hook: state.entities.integrations.outgoingHooks[hookId],
        updateOutgoingHookRequest: state.requests.integrations.createOutgoingHook
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        updateOutgoingHook,
        getOutgoingHook
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EditOutgoingWebhook);
