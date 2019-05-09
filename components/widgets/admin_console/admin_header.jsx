// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class SettingsGroup extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.node.isRequired,
            button: PropTypes.bool,
        };
    }

    render() {
        let headerClass = '';

        if (this.props.button) {
            headerClass = 'justify-content-between';
        }

        return (
            <div className={'admin-console__header ' + headerClass}>
                {this.props.children}
            </div>
        );
    }
}
