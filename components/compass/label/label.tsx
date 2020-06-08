// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './label.scss';

export default class Label extends React.PureComponent {
    render() {
        return (
            <span
                className='Label Label___standard'
                title='Lorem ipsum dolor sit amet, consectetur adipiscing.'
            >
                {'Lorem ipsum dolor sit amet, consectetur adipiscing.'}
            </span>
        );
    }
}
