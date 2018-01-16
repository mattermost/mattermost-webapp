// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class SystemPermissionGate extends React.PureComponent {
    static defaultProps = {
        invert: false
    }

    static propTypes = {

        /**
         * Permissions enough to pass the gate (space separated)
         */
        perms: PropTypes.string.isRequired,

        /**
         * Has permission
         */
        hasPerm: PropTypes.bool.isRequired,

        /**
         * Invert the permission (used for else)
         */
        invert: PropTypes.bool.isRequired,

        /**
         * Content protected by the permissions gate
         */
        children: PropTypes.node.isRequired
    };

    render() {
        if (this.props.hasPerm && !this.props.invert) {
            return this.props.children;
        }
        if (!this.props.hasPerm && this.props.invert) {
            return this.props.children;
        }
        return null;
    }
}
