// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, NavLink} from 'react-router-dom';

export default class BackstageCategory extends React.PureComponent {
    static get propTypes() {
        return {
            name: PropTypes.string.isRequired,
            title: PropTypes.node.isRequired,
            icon: PropTypes.string.isRequired,
            parentLink: PropTypes.string,
            children: PropTypes.arrayOf(PropTypes.element),
        };
    }

    static get defaultProps() {
        return {
            parentLink: '',
            children: [],
        };
    }

    render() {
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
