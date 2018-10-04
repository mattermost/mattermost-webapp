// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

const DropdownMenuItemGroup = ({children}) => (
    <React.Fragment>
        {children}
        {children.length && (
            <li className='divider'/>
        )}
    </React.Fragment>
);

DropdownMenuItemGroup.propTypes = {
    children: PropTypes.any,
};

export default DropdownMenuItemGroup;
