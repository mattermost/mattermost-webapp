// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import Pluggable from './pluggable.jsx';
import {withRouter} from 'react-router-dom';

function mapStateToProps(state) {
    const products = state.plugins.components.Product;

    return {
        components: state.plugins.components,
        theme: getTheme(state),
        products,
    };
}

export default withRouter(connect(mapStateToProps)(Pluggable));
