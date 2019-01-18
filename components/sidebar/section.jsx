// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export const Section = ({children}) => (
    <ul className='nav nav-pills nav-stacked'>
        {children}
    </ul>
);

export const SectionHeader = ({id, children}) => (
    <li>
        <h4 id={id}>
            {children}
        </h4>
    </li>
);

export const SectionItem = ({active, children}) => {
    let className = '';
    if (active) {
        className = 'active';
    }

    return (
        <li className={className}>
            {children}
        </li>
    );
};

export const SectionItemLink = ({text, icon, to, unread, count, onClick}) => {
    let className = 'sidebar-item';

    if (unread) {
        className += ' unread-title';
    }

    let badge;
    if (count > 0) {
        className += ' has-badge';

        badge = <span className='badge'>{count}</span>;
    }

    return (
        <React.Fragment>
            <a href='www.google.com' className={className}>
                {icon}
                <span className='sidebar-item__name'>{text}</span>
                {badge}
            </a>
        </React.Fragment>
    )
};
