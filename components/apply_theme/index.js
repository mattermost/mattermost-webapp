// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import ApplyTheme from 'components/apply_theme/apply_theme';

const mapStateToProps = (state) => ({
    theme: getTheme(state)
});

export default connect(mapStateToProps)(ApplyTheme);
