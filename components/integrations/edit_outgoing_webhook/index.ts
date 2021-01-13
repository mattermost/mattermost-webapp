// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {getOutgoingHook, updateOutgoingHook} from 'mattermost-redux/actions/integrations';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {OutgoingWebhook} from 'mattermost-redux/types/integrations';
import {ServerError} from 'mattermost-redux/types/errors';

import EditOutgoingWebhook from './edit_outgoing_webhook';

type OwnProps = {
    location: {
        search: string | string[][] | Record<string, string> | URLSearchParams | undefined;
    };
}

type Actions = {
    updateOutgoingHook: (hook: OutgoingWebhook) => Promise<{ data: OutgoingWebhook; error: ServerError }>;
    getOutgoingHook: (hookId: string) => Promise<{ data: OutgoingWebhook; error: ServerError }>;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const hookId = (new URLSearchParams(ownProps.location.search)).get('id');
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    return {
        hookId: hookId!,
        hook: state.entities.integrations.outgoingHooks[hookId!],
        enableOutgoingWebhooks,
        enablePostUsernameOverride,
        enablePostIconOverride,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            updateOutgoingHook,
            getOutgoingHook,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditOutgoingWebhook);
