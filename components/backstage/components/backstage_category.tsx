// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route, NavLink} from 'react-router-dom';

type Props = {
    name: string;
    title: React.ReactNode;
    icon: string;
    parentLink?: string;
    children?: React.ReactElement[];
};

export default class BackstageCategory extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        parentLink: '',
        children: [],
    }

    render(): React.ReactNode {
        const {name, title, icon, parentLink, children} = this.props;

        const link = parentLink + '/' + name;

        return (
            <li className='backstage-sidebar__category'>
                <NavLink
                    to={link}
                    className='category-title'
                    activeClassName='category-title--active'
                >
                    <i className={'fa ' + icon}/>
                    <span className='category-title__text'>
                        {title}
                    </span>
                </NavLink>
                {
                    children && children.length > 0 &&
                    <Route
                        path={link}
                        render={() => (
                            <ul className='sections'>
                                {
                                    React.Children.map(children, (child) => {
                                        if (!child) {
                                            return child;
                                        }

                                        return React.cloneElement(child, {
                                            parentLink: link,
                                        });
                                    })
                                }
                            </ul>
                        )}
                    />
                }
            </li>
        );
    }
}
