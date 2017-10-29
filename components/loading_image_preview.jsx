// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default function LoadingImagePreview({progress, loading}) {
    let progressView = null;
    if (progress) {
        progressView = (
            <span className='loader-percent'>
                {loading + progress + '%'}
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
    progress: PropTypes.number,
    loading: PropTypes.string
};
