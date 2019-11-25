import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAllThemes} from 'mattermost-redux/actions/themes';

import ThemePicker from './theme_picker';
import { Dispatch } from 'react';
import { GenericAction, DispatchFunc } from 'mattermost-redux/types/actions';
import { GlobalState } from 'mattermost-redux/types/store';
import {saveTheme, deleteTheme, getTheme} from 'mattermost-redux/actions/themes';
import { getConfig } from 'mattermost-redux/selectors/entities/general';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        defaultName: config.DefaultTheme,
    };
}

function mapDispatchToProps(dispatch: DispatchFunc) {
    return {
        actions: bindActionCreators({
            saveTheme,
            deleteTheme,
            getTheme,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ThemePicker);