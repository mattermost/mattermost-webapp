// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {NavLink} from 'react-router-dom';
import './sidebar.scss';

const Sidebar = () => {
    return (
        <div className='People__LHS'>
            <NavLink
                exact={true}
                className='Link'
                activeClassName='active'
                to='/people'
            >
                <FormattedMessage
                    defaultMessage='People'
                    id='people.sidebar.people-label'
                />
            </NavLink>
            <NavLink
                className='Link'
                activeClassName='active'
                to='/people/groups'
            >
                <FormattedMessage
                    defaultMessage='Groups'
                    id='people.sidebar.groups-label'
                />
            </NavLink>
        </div>
    );
};

export default Sidebar;
