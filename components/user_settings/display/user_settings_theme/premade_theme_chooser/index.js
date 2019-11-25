// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import * as hmm from 'mattermost-redux/actions/themes';

import PremadeThemeChooser from './premade_theme_chooser';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        allowedThemes: (config.AllowedThemes && config.AllowedThemes.split(',')) || [],
        systemThemes: state.entities.themes.themes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getAllThemes: hmm.getAllThemes,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PremadeThemeChooser);
