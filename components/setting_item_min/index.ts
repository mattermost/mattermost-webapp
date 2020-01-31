// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {getPreviousActiveSection} from 'selectors/views/settings';
import {updateActiveSection} from 'actions/views/settings';

import SettingItemMin from './setting_item_min';

function mapStateToProps(state: GlobalState) {
    return {
        previousActiveSection: getPreviousActiveSection(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            updateActiveSection,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingItemMin);
