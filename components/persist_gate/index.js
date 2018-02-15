// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import PersistGate from './persist_gate';

const mapStateToProps = (state) => ({
    initialized: state.storage.initialized
});

export default connect(mapStateToProps)(PersistGate);
