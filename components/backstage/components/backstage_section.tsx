// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {NavLink} from 'react-router-dom';

type Props = {
    name: string;
    title: React.ReactNode;
    parentLink?: string;
    subsection?: boolean;
    children: React.ReactElement[];
    id?: string;
};

export default class BackstageSection extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        parentLink: '',
        subsection: false,
        children: [],
    }

    getLink(): string {
        return this.props.parentLink + '/' + this.props.name;
    }

    render(): React.ReactNode {
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
