// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {OAuthApp} from 'mattermost-redux/types/integrations';

import {allowOAuth2, getOAuthAppInfo} from 'actions/admin_actions.jsx';

import Authorize, {Params} from './authorize';

type Actions = {
    getOAuthAppInfo: (clientId: string | null) => Promise<{data: OAuthApp; error?: Error}>;
    allowOAuth2: (params: Params) => Promise<{data?: any; error?: Error}>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getOAuthAppInfo,
            allowOAuth2,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(Authorize);
