// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getPreviousActiveSection} from 'selectors/views/settings';
import {updateActiveSection} from 'actions/views/settings';

import SettingItemMin from './setting_item_min.jsx';

function mapStateToProps(state) {
    return {
        previousActiveSection: getPreviousActiveSection(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateActiveSection,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingItemMin);
