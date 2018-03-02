// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class FlagIconFilled extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg version="1.1" width="36" height="36"  viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xlinkHref="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"><title>flag-solid</title><path class="clr-i-solid clr-i-solid-path-1" d="M5.92,2a1,1,0,0,0-1,1V33a1,1,0,0,0,2,0V3A1,1,0,0,0,5.92,2Z"></path><path class="clr-i-solid clr-i-solid-path-2" d="M30.5,3.82a1,1,0,0,0-1,0,14.9,14.9,0,0,1-6.13,1.16,13.11,13.11,0,0,1-5.18-1.49A12.78,12.78,0,0,0,13.2,2,10.86,10.86,0,0,0,9,2.85V20a8.8,8.8,0,0,1,4.25-1.08,11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66,16.79,16.79,0,0,0,7-1.37,1,1,0,0,0,.55-.89V4.67A1,1,0,0,0,30.5,3.82Z"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
            </span>
        );
    }
}
