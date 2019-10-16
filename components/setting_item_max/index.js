// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateActiveSection} from 'actions/views/settings';

import SettingItemMax from './setting_item_max';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateActiveSection,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(SettingItemMax);