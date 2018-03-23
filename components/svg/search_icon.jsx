// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class SearchIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg
                    width='15px'
                    height='16px'
                    viewBox='0 0 19 18'
                >
                    <g
                        stroke='inherit'
                        strokeWidth='1'
                        fill='none'
                        fillRule='evenodd'
                    >
                        <g
                            transform='translate(-719.000000, -20.000000)'
                            strokeWidth='1.5'
                        >
                            <g transform='translate(0.000000, 1.000000)'>
                                <g transform='translate(63.000000, 10.000000)'>
                                    <g transform='translate(657.000000, 10.000000)'>
                                        <circle
                                            cx='7'
                                            cy='7'
                                            r='7'
                                        />
                                        <path
                                            d='M12.5,11.5 L16.5,15.5'
                                            strokeLinecap='round'
                                        />
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </span>
        );
    }
}
