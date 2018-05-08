// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PremadeThemeChooser from './premade_theme_chooser.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const allowedThemes = (config.AllowedThemes && config.AllowedThemes.split(',')) || [];

    return {
        allowedThemes,
    };
}

export default connect(mapStateToProps)(PremadeThemeChooser);
