// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

export default class StatusOnlineIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <svg
                    width='13px'
                    height='13px'
                    viewBox='0 0 20 20'
                    style={style}
                >
                    <path
                        className='online--icon'
                        d='M10,0c5.519,0 10,4.481 10,10c0,5.519 -4.481,10 -10,10c-5.519,0 -10,-4.481 -10,-10c0,-5.519 4.481,-10 10,-10Zm6.19,7.18c0,0.208 -0.075,0.384 -0.224,0.53l-5.782,5.64l-1.087,1.059c-0.149,0.146 -0.33,0.218 -0.543,0.218c-0.213,0 -0.394,-0.072 -0.543,-0.218l-1.086,-1.059l-2.891,-2.82c-0.149,-0.146 -0.224,-0.322 -0.224,-0.53c0,-0.208 0.075,-0.384 0.224,-0.53l1.086,-1.059c0.149,-0.146 0.33,-0.218 0.543,-0.218c0.213,0 0.394,0.072 0.543,0.218l2.348,2.298l5.24,-5.118c0.149,-0.146 0.33,-0.218 0.543,-0.218c0.213,0 0.394,0.072 0.543,0.218l1.086,1.059c0.149,0.146 0.224,0.322 0.224,0.53Z'
                    />
                </svg>
            </span>
        );
    }
}

const style = {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    strokeLinejoin: 'round',
    strokeMiterlimit: 1.41421
};
