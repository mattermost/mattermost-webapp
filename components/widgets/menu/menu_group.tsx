// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './menu_group.scss';

type Props = {
    divider?: React.ReactNode;
    children?: React.ReactNode;
}

export default class MenuGroup extends React.PureComponent<Props> {
    public render() {
        const {children} = this.props;

        const divider = this.props.divider || <li className='MenuGroup menu-divider'/>;

        return (
            <React.Fragment>
                {divider}
                {children}
            </React.Fragment>
        );
    }
}