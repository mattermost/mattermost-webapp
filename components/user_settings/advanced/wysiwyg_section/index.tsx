// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'types/store/index.js';

import {GenericAction} from 'mattermost-redux/types/actions.js';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getWysiwygPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import WysiwygSection from './wysiwyg_section';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
        wysiwygEnabled: getWysiwygPreference(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WysiwygSection);
