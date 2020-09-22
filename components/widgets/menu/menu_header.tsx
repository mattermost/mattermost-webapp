// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './menu_header.scss';

type Props = {
    divider?: React.ReactNode;
    children?: React.ReactNode;
}

export default class MenuHeader extends React.PureComponent<Props> {
    public render() {
        const {children} = this.props;

        return (
            <li className='MenuHeader'>
                {children}
            </li>
        );
    }
}
