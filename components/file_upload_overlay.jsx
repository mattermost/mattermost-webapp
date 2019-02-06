// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import fileOverlayImage from 'images/filesOverlay.png';
import overlayLogoImage from 'images/logoWhite.png';

export default function FileUploadOverlay(props) {
    var overlayClass = 'file-overlay hidden';
    if (props.overlayType === 'right') {
        overlayClass += ' right-file-overlay';
    } else if (props.overlayType === 'center') {
        overlayClass += ' center-file-overlay';
    }

    return (
        <div className={overlayClass}>
            <div className='overlay__indent'>
                <div className='overlay__circle'>
                    <img
                        className='overlay__files'
                        src={fileOverlayImage}
                        alt='Files'
                    />
                    <span>
                        <FormattedMessage
                            id='generic_icons.upload'
                            defaultMessage='Upload Icon'
                        >
                            {(title) => (
                                <i
                                    className='fa fa-upload'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
                        <FormattedMessage
                            id='upload_overlay.info'
                            defaultMessage='Drop a file to upload it.'
                        />
                    </span>
                    <img
                        className='overlay__logo'
                        src={overlayLogoImage}
                        width='100'
                        alt='Logo'
                    />
                </div>
            </div>
        </div>
    );
}

FileUploadOverlay.propTypes = {
    overlayType: PropTypes.string,
};
