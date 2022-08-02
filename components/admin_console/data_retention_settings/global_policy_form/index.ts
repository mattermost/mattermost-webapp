// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {
    updateConfig,
} from 'mattermost-redux/actions/admin';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import {AdminConfig} from 'mattermost-redux/types/config';
import {ServerError} from 'mattermost-redux/types/errors';

import GlobalPolicyForm from './global_policy_form';

type Actions = {
    updateConfig: (config: Record<string, any>) => Promise<{ data?: AdminConfig; error?: ServerError }>;
    setNavigationBlocked: (blocked: boolean) => void;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            updateConfig,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(GlobalPolicyForm);
