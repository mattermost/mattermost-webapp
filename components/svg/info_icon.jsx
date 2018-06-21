// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class InfoIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg
                    width='22px'
                    height='22px'
                    viewBox='0 0 22 22'
                    role='icon'
                    aria-label={localizeMessage('generic_icons.info', 'Info Icon')}
                >
                    <g
                        stroke='none'
                        strokeWidth='1'
                        fill='inherit'
                        fillRule='evenodd'
                    >
                        <g
                            transform='translate(-388.000000, -18.000000)'
                            fill='inherit'
                        >
                            <g>
                                <g transform='translate(381.000000, 11.000000)'>
                                    <g transform='translate(7.000000, 7.000000)'>
                                        <path d='M11,22 C4.92486775,22 0,17.0751322 0,11 C0,4.92486775 4.92486775,0 11,0 C17.0751322,0 22,4.92486775 22,11 C22,17.0751322 17.0751322,22 11,22 Z M11,20.7924685 C16.408231,20.7924685 20.7924685,16.408231 20.7924685,11 C20.7924685,5.59176898 16.408231,1.20753149 11,1.20753149 C5.59176898,1.20753149 1.20753149,5.59176898 1.20753149,11 C1.20753149,16.408231 5.59176898,20.7924685 11,20.7924685 Z M10.1572266,16.0625 L10.1572266,8.69335938 L11.3466797,8.69335938 L11.3466797,16.0625 L10.1572266,16.0625 Z M10.7519531,7.50390625 C10.3417969,7.50390625 10,7.16210938 10,6.75195312 C10,6.33496094 10.3417969,6 10.7519531,6 C11.1689453,6 11.5039062,6.33496094 11.5039062,6.75195312 C11.5039062,7.16210938 11.1689453,7.50390625 10.7519531,7.50390625 Z'/>
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
