// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import CheckmarkIcon from 'components/svg/checkmark_icon.jsx';

const UploadProgress = {
    prefixClass: 'file-upload-progress',
    strokeWidth: 7,
    strokeColor: '#333333',
    trailWidth: 7,
    trailColor: '#6C7783',
    strokeLinecap: 'round',
};

export default class FileUploadProgress extends React.PureComponent {
    static propTypes = {
        percent: PropTypes.number.isRequired,
    };

    render() {
        const {
            prefixClass,
            strokeWidth,
            strokeColor,
            trailWidth,
            trailColor,
            strokeLinecap,
        } = UploadProgress;

        const percent = Math.floor(this.props.percent || 0);
        const radius = 50 - (strokeWidth / 2);
        const {pathString, pathStyle} = this.computePathString(radius, percent);

        return (
            <div className={prefixClass}>
                <svg
                    className={`${prefixClass}__circle`}
                    viewBox='0 0 100 100'
                >
                    <path
                        className={`${prefixClass}__circle-trail`}
                        d={pathString}
                        stroke={trailColor}
                        strokeWidth={trailWidth || strokeWidth}
                        fillOpacity='0'
                    />
                    <path
                        className={`${prefixClass}__circle-path`}
                        d={pathString}
                        strokeLinecap={strokeLinecap}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fillOpacity='0'
                        style={pathStyle}
                    />
                    <text
                        className={`${prefixClass}__inside-text`}
                        x='50%'
                        y='51%'
                        textAnchor='middle'
                        stroke='#00'
                        dy='.3em'
                    >
                        {percent !== 100 && `${percent}%`}
                    </text>
                </svg>

                {percent === 100 && (
                    <span className='checkmark'>
                        <CheckmarkIcon/>
                    </span>
                )}

            </div>
        );
    }

    computePathString(radius, percent) {
        const len = Math.PI * 2 * radius;
        return {
            pathString: `M 50, 50 m 0, -${radius}
                         a ${radius}, ${radius} 0 1 1 0,  ${2 * radius}
                         a ${radius}, ${radius} 0 1 1 0, -${2 * radius}`,
            pathStyle: {
                strokeDasharray: `${len}px ${len}px`,
                strokeDashoffset: `${((100 - percent) / 100) * len}px`,
                transition: 'stroke-dashoffset 0.2s ease 0s, stroke 0.2s ease',
            },
        };
    }
}
