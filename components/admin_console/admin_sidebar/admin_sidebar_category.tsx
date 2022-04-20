// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {NavLink, Route} from 'react-router-dom';

type Props = {
    icon: string;
    title: JSX.Element;
    action?: JSX.Element;
    children?: JSX.Element | JSX.Element[]; // TODO invalid prop supplied to children
    definitionKey?: string;
    name?: string;
    parentLink?: string;
    sectionClass?: string;
}

const AdminSidebarCategory = ({icon, title, action, children, definitionKey, name, parentLink = '', sectionClass}: Props) => {
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
