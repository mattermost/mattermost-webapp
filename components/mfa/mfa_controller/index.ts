// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import MFAController from './mfa_controller';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const enableMultifactorAuthentication = config.EnableMultifactorAuthentication === 'true';
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        enableMultifactorAuthentication,
        enforceMultifactorAuthentication,
    };
}

export default connect(mapStateToProps)(MFAController);
