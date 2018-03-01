// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class FlagIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg version="1.1" width="36" height="36"  viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xlinkHref="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"><title>flag-line</title><path class="clr-i-outline clr-i-outline-path-1" d="M6,34a1,1,0,0,1-1-1V3A1,1,0,0,1,7,3V33A1,1,0,0,1,6,34Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M30.55,3.82a1,1,0,0,0-1,0,14.9,14.9,0,0,1-6.13,1.16,13.11,13.11,0,0,1-5.18-1.49,12.78,12.78,0,0,0-5-1.45A10.86,10.86,0,0,0,9,2.85V5.08A8.8,8.8,0,0,1,13.25,4a11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66A18.75,18.75,0,0,0,29,6.12V18.95a16.16,16.16,0,0,1-5.58.93,13.11,13.11,0,0,1-5.18-1.49,12.78,12.78,0,0,0-5-1.45A10.86,10.86,0,0,0,9,17.79V20a8.8,8.8,0,0,1,4.25-1.08,11.22,11.22,0,0,1,4.2,1.28,14.84,14.84,0,0,0,6,1.66,16.79,16.79,0,0,0,7-1.37,1,1,0,0,0,.55-.89V4.67A1,1,0,0,0,30.55,3.82Z"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
            </span>
        );
    }
}
