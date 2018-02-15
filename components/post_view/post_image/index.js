// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import PostImage from './post_image.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const hasImageProxy = config.HasImageProxy === 'true';

    return {
        ...ownProps,
        hasImageProxy
    };
}

export default connect(mapStateToProps)(PostImage);
