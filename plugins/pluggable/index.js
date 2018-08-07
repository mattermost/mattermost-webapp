// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import Pluggable from './pluggable.jsx';

function mapStateToProps(state) {
    return {
        components: state.plugins.components,
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(Pluggable);
