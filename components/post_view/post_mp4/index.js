// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostMp4 from './post_mp4.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const hasImageProxy = config.HasImageProxy === 'true';

    return {
<<<<<<< HEAD
        hasImageProxy
=======
        hasImageProxy,
>>>>>>> f4d862fed764040ccb16ce47407aa65da7f3ad40
    };
}

export default connect(mapStateToProps)(PostMp4);
