// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {connect} from 'react-redux';

import MarketplaceList from './marketplace_list';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(MarketplaceList);
