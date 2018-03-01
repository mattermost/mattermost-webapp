// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class GlobeIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg version="1.1" width="36" height="36"  viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xlinkHref="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"><title>talk-bubbles-solid</title><path d="M8,19V11H5a3,3,0,0,0-3,3V32a1,1,0,0,0,.56.89,1,1,0,0,0,1-.1L8.71,29H22.15A2.77,2.77,0,0,0,25,26.13V25H14A6,6,0,0,1,8,19Z" class="clr-i-solid clr-i-solid-path-1"></path><path d="M31,4H14a3,3,0,0,0-3,3V19a3,3,0,0,0,3,3H27.55l4.78,3.71a1,1,0,0,0,1,.11,1,1,0,0,0,.57-.9V7A3,3,0,0,0,31,4Z" class="clr-i-solid clr-i-solid-path-2"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
            </span>
        );
    }
}
