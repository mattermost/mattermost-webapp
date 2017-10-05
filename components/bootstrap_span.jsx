// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

class BootstrapSpan extends React.PureComponent {

    static propTypes = {
        children: PropTypes.element
    }

    render() {
        const {children, ...props} = this.props;
        delete props.bsRole;
        delete props.bsClass;

        return <span {...props}>{children}</span>;
    }
}

export default BootstrapSpan;
