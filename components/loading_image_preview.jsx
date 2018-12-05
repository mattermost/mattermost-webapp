// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingWrapper from 'components/widgets/loading_wrapper.jsx';

export default function LoadingImagePreview({loading, progress, containerClass}) {
    let progressView = null;
    if (progress) {
        progressView = (
            <span className='loader-percent'>
                {`${loading} ${progress}%`}
            </span>
        );
    }

    return (
        <div className={containerClass}>
            <LoadingWrapper type='bars'/>
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
    loading: PropTypes.string,

    /**
     * Loading style
     */
    containerClass: PropTypes.string,
};

LoadingImagePreview.defaultProps = {
    containerClass: 'view-image__loading',
};
