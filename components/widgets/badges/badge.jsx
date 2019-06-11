// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import './badge.scss';

export default class Badge extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        show: true,
        className: '',
    };

    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div className='Badge'>
                <div className={'Badge__box ' + this.props.className}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
