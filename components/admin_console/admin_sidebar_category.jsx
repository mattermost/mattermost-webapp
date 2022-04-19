// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {NavLink, Route} from 'react-router-dom';

export default class AdminSidebarCategory extends React.PureComponent {
    static get propTypes() {
        return {
            name: PropTypes.string,
            title: PropTypes.node.isRequired,
            icon: PropTypes.string.isRequired,
            sectionClass: PropTypes.string,
            parentLink: PropTypes.string,
            children: PropTypes.node,
            action: PropTypes.node,
            definitionKey: PropTypes.string,
        };
    }

    static get defaultProps() {
        return {
            parentLink: '',
        };
    }

    render() {
        let link = this.props.parentLink;
        let title = (
            <div className='category-title category-title--active'>
                <i className={'category-icon fa ' + this.props.icon}/>
                <span className='category-title__text'>
                    {this.props.title}
                </span>
                {this.props.action}
            </div>
        );

        if (this.props.name) {
            link += '/' + name;
            title = (
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
        if (this.props.children) {
            clonedChildren = (
                <Route
                    path={link}
                    render={() => (
                        <ul className={'sections ' + this.props.sectionClass}>
                            {
                                React.Children.map(this.props.children, (child) => {
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
                data-testid={this.props.definitionKey}
            >
                {title}
                {clonedChildren}
            </li>
        );
    }
}
