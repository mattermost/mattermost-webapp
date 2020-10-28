// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {NavLink} from 'react-router-dom';

export default class BackstageSection extends React.PureComponent {
    static get propTypes() {
        return {
            name: PropTypes.string.isRequired,
            title: PropTypes.node.isRequired,
            parentLink: PropTypes.string,
            subsection: PropTypes.bool,
            children: PropTypes.arrayOf(PropTypes.element),
            id: PropTypes.string,
        };
    }

    static get defaultProps() {
        return {
            parentLink: '',
            subsection: false,
            children: [],
        };
    }

    getLink() {
        return this.props.parentLink + '/' + this.props.name;
    }

    render() {
        const {title, subsection, children} = this.props;

        const link = this.getLink();

        let clonedChildren = null;
        if (children.length > 0) {
            clonedChildren = (
                <ul className='subsections'>
                    {
                        React.Children.map(children, (child) => {
                            return React.cloneElement(child, {
                                parentLink: link,
                                subsection: true,
                            });
                        })
                    }
                </ul>
            );
        }

        let className = 'section';
        if (subsection) {
            className = 'subsection';
        }

        return (
            <li
                className={className}
                id={this.props.id}
            >
                <NavLink
                    className={`${className}-title`}
                    activeClassName={`${className}-title--active`}
                    to={link}
                >
                    <span className={`${className}-title__text`}>
                        {title}
                    </span>
                </NavLink>
                {clonedChildren}
            </li>
        );
    }
}
