// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {patchConfig} from 'mattermost-redux/actions/admin';

import {GenericAction} from 'mattermost-redux/types/actions';

import EnterSupportEmail from './enter_support_email';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const supportEmail = config.SupportEmail ? config.SupportEmail : '';
    return {
        supportEmail,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            patchConfig,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnterSupportEmail);
