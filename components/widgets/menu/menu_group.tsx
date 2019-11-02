// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './menu_group.scss';

type Props = {
    divider?: React.ReactNode;
    children?: React.ReactNode;
}

const MenuGroup: React.FC<Props> = (props: Props) => {
    const {children} = props;

    const divider = props.divider || <li className='MenuGroup menu-divider'/>;

    return (
        <React.Fragment>
            {divider}
            {children}
        </React.Fragment>
    );
};

export default MenuGroup;