// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getAllThemes} from 'mattermost-redux/actions/themes';

import PremadeThemeChooser from './premade_theme_chooser.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    
    return {
        allowedThemes: (config.AllowedThemes && config.AllowedThemes.split(',')) || [],
        themes: state.entities.themes.themes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getAllThemes,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PremadeThemeChooser);
