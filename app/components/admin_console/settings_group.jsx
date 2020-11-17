// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class SettingsGroup extends React.PureComponent {
    static get propTypes() {
        return {
            show: PropTypes.bool.isRequired,
            header: PropTypes.node,
            children: PropTypes.node,
            container: PropTypes.bool,
        };
    }

    static get defaultProps() {
        return {
            show: true,
            container: true,
        };
    }

    render() {
        let wrapperClass = '';
        let contentClass = '';

        if (!this.props.show) {
            return null;
        }

        if (this.props.container) {
            wrapperClass = 'admin-console__wrapper';
            contentClass = 'admin-console__content';
        }

        let header = null;
        if (this.props.header) {
            header = (
                <h4>
                    {this.props.header}
                </h4>
            );
        }

        return (
            <div className={wrapperClass}>
                <div className={contentClass}>
                    {header}
                    {this.props.children}
                </div>
            </div>
        );
    }
}
