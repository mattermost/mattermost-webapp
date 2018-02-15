// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import Pluggable from './pluggable.jsx';

const mapStateToProps = (state) => ({
    components: state.plugins.components,
    theme: getTheme(state)
});

export default connect(mapStateToProps)(Pluggable);
