// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class AdminHeader extends React.Component {
    public static get propTypes() {
        return {
            children: PropTypes.node.isRequired,
        };
    }

    public render() {
        return (
            <div className={'admin-console__header'}>
                {this.props.children}
            </div>
        );
    }
}
