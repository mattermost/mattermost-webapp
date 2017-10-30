// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import loadingGif from 'images/load.gif';

export default function LoadingImagePreview({loading, progress}) {
    let progressView = null;
    if (progress) {
        progressView = (
            <span className='loader-percent'>
                {`${loading} ${progress}%`}
            </span>
        );
    }

    return (
        <div className='view-image__loading'>
            <img
                className='loader-image'
                src={loadingGif}
            />
            {progressView}
        </div>
    );
}

LoadingImagePreview.propTypes = {

    /**
     * The percent number of the progress
     */
    progress: PropTypes.number,

    /**
     * The loading message to display
     */
    loading: PropTypes.string
};
