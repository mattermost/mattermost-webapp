// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createOutgoingHook} from 'mattermost-redux/actions/integrations';

import AddOutgoingWebhook from './add_outgoing_webhook.jsx';

const mapStateToProps = (state) => ({
    createOutgoingHookRequest: state.requests.integrations.createOutgoingHook
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        createOutgoingHook
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddOutgoingWebhook);
