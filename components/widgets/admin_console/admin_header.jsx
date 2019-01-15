// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

const AdminHeader = (props) => (
    <h3 className='admin-console-header'>
        {props.children}
    </h3>
);

AdminHeader.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AdminHeader;
