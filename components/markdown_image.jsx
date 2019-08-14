// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ExternalImage from 'components/external_image';
import SizeAwareImage from 'components/size_aware_image';

export default function MarkdownImage({imageMetadata, src, ...props}) {
    return (
        <ExternalImage
            src={src}
            imageMetadata={imageMetadata}
        >
            {(safeSrc) => {
                if (!safeSrc) {
                    return (
                        <a
                            className='theme markdown__link'
                            href={src}
                            rel='noopener noreferrer'
                            target='_blank'
                            title={props.title}
                        >
                            {props.alt}
                        </a>
                    );
                }

                return (
                    <SizeAwareImage
                        {...props}
                        src={safeSrc}
                    />
                );
            }}
        </ExternalImage>
    );
}

MarkdownImage.propTypes = {
    alt: PropTypes.string,
    imageMetadata: PropTypes.object,
    src: PropTypes.string.isRequired,
    title: PropTypes.string,
};
