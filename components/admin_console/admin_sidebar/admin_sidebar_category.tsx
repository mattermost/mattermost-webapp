// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {NavLink, Route} from 'react-router-dom';

type Props = {
    children: JSX.Element | JSX.Element[]; // TODO
    definitionKey: string;
    icon: string;
    parentLink: string;
    sectionClass: string;
    title: JSX.Element;
    action?: JSX.Element;
    name?: string;
}

const AdminSidebarCategory = ({children, definitionKey, icon, parentLink = '', sectionClass, title, name, action}: Props) => {
    let link = parentLink;
    let titleDiv = (
        <div className='category-title category-title--active'>
            <i className={'category-icon fa ' + icon}/>
            <span className='category-title__text'>
                {title}
            </span>
            {action}
        </div>
    );

    if (name) {
        link += '/' + name;
        titleDiv = (
            <NavLink
                to={link}
                className='category-title'
                activeClassName='category-title category-title--active'
            >
                {title}
            </NavLink>
        );
    }

    let clonedChildren = null;
    if (children) {
        clonedChildren = (
            <Route
                path={link}
                render={() => (
                    <ul className={'sections ' + sectionClass}>
                        {
                            React.Children.map(children, (child) => {
                                if (child === null) {
                                    return null;
                                }

                                return React.cloneElement(child, {
                                    parentLink: link,
                                });
                            })
                        }
                    </ul>
                )}
            />
        );
    }

    return (
        <li
            className='sidebar-category'
            data-testid={definitionKey}
        >
            {titleDiv}
            {clonedChildren}
        </li>
    );
};

export default AdminSidebarCategory;
