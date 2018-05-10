// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import PersistGate from './persist_gate';

function mapStateToProps(state) {
    return {
        initialized: state.storage.initialized,
    };
}

export default connect(mapStateToProps)(PersistGate);
