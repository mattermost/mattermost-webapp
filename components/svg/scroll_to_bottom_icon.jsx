// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class ScrollToBottomIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg
                    id='Layer_1'
                    x='0px'
                    y='0px'
                    viewBox='-239 239 21 23'
                    style={style}
                >
                    <path d='M-239,241.4l2.4-2.4l8.1,8.2l8.1-8.2l2.4,2.4l-10.5,10.6L-239,241.4z M-228.5,257.2l8.1-8.2l2.4,2.4l-10.5,10.6l-10.5-10.6 l2.4-2.4L-228.5,257.2z'/>
                </svg>
            </span>
        );
    }
}

const style = {
    enableBackground: 'new -239 239 21 23'
};
