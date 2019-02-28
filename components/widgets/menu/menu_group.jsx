// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class MenuGroup extends React.PureComponent {
    static propTypes = {
        divider: PropTypes.node,
        children: PropTypes.node,
    };

    render() {
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
