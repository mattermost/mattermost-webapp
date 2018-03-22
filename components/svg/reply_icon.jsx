// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class ReplyIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg version="1.1" width="36" height="36"  viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xlinkHref="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" style={style}><title>undo-line</title><path d="M20.87,11.14h-13l5.56-5.49A1,1,0,0,0,12,4.22L4,12.13,12,20a1,1,0,0,0,1.41-1.42L7.86,13.14h13a9.08,9.08,0,0,1,9.13,9,9,9,0,0,1-5,8A1,1,0,0,0,25.93,32a11,11,0,0,0-5.06-20.82Z" class="clr-i-outline clr-i-outline-path-1"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>
            </span>
        );
    }
}

const style = {
    enableBackground: 'new -158 242 18 18',
};
