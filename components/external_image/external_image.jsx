// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {getImageSrc} from 'utils/post_utils.jsx';

export default class ExternalImage extends React.PureComponent {
    static propTypes = {
        children: PropTypes.func.isRequired,
        enableSVGs: PropTypes.bool.isRequired,
        hasImageProxy: PropTypes.bool.isRequired,
        imageMetadata: PropTypes.object,
        src: PropTypes.string.isRequired,
    };

    shouldRenderImage = () => {
        if (this.props.imageMetadata && this.props.imageMetadata.format === 'svg' && !this.props.enableSVGs) {
            return false;
        }

        return true;
    }

    render() {
        let src = getImageSrc(this.props.src, this.props.hasImageProxy);

        if (!this.shouldRenderImage()) {
            src = '';
        }

        return this.props.children(src);
    }
}
