// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        diagnosticsEnabled: config.DiagnosticsEnabled === 'true',
        noAccounts: config.NoAccounts === 'true',
    };
}

export default connect(mapStateToProps)(Root);
