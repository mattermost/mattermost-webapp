// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import PremadeThemeChooser from './premade_theme_chooser.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const allowedThemes = (config.AllowedThemes && config.AllowedThemes.split(',')) || [];

    return {
        ...ownProps,
        allowedThemes
    };
}

export default connect(mapStateToProps)(PremadeThemeChooser);
