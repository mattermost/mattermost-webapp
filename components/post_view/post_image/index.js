// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostImage from './post_image.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const hasImageProxy = config.HasImageProxy === 'true';

    return {
        hasImageProxy,
    };
}

export default connect(mapStateToProps)(PostImage);
