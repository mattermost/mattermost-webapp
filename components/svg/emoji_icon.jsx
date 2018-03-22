// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class EmojiIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg version="1.1" width="36" height="36"  viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xlinkHref="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"><title>happy-face-line</title><path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z" class="clr-i-outline clr-i-outline-path-1"></path><circle cx="10.89" cy="13.89" r="2" class="clr-i-outline clr-i-outline-path-2"></circle><circle cx="25.05" cy="13.89" r="2" class="clr-i-outline clr-i-outline-path-3"></circle><path d="M18.13,28.21a8.67,8.67,0,0,0,8.26-6H9.87A8.67,8.67,0,0,0,18.13,28.21Z" class="clr-i-outline clr-i-outline-path-4"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
            </span>
        );
    }
}
