// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingSVG({width, height, fill}) {
    const yAnimation = `${(height / 2) - 5}; ${(height / 2) - 13}; ${(height / 2) - 5};`;
    const rectangles = [
        {x: -10, begin: '0s'},
        {x: 0, begin: '0.15s'},
        {x: 10, begin: '0.3s'},
    ];
    return (
        <svg
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            x='0px'
            y='0px'
            width={`${width}px`}
            height={`${height}px`}
            viewBox={`0 0 ${width} ${height}`}
            style={{
                enableBackground: 'new 0 0 50 50',
                verticalAlign: 'middle',
                maxHeight: height,
                maxWidth: width,
            }}
        >
            {rectangles.map((rectangle) => (
                <rect
                    x={`${(width / 2) + rectangle.x}`}
                    y={`${(height / 2) - 13}`}
                    width='4'
                    height='5'
                    fill={fill}
                    key={rectangle.begin}
                >
                    <animate
                        attributeName='height'
                        attributeType='XML'
                        values='5;21;5'
                        begin={rectangle.begin}
                        dur='0.6s'
                        repeatCount='indefinite'
                    />
                    <animate
                        attributeName='y'
                        attributeType='XML'
                        values={yAnimation}
                        begin={rectangle.begin}
                        dur='0.6s'
                        repeatCount='indefinite'
                    />
                </rect>
            ))}
        </svg>
    );
}

LoadingSVG.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    fill: PropTypes.string,
};

