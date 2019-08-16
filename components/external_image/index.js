// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ExternalImage from './external_image';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        enableSVGs: config.EnableSVGs === 'true',
        hasImageProxy: config.HasImageProxy === 'true',
    };
}

export default connect(mapStateToProps)(ExternalImage);
