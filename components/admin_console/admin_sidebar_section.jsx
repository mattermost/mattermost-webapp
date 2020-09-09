// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import * as Utils from 'utils/utils.jsx';

export default class AdminSidebarSection extends React.PureComponent {
    static get propTypes() {
        return {
            name: PropTypes.string.isRequired,
            title: PropTypes.node.isRequired,
            type: PropTypes.string,
            parentLink: PropTypes.string,
            subsection: PropTypes.bool,
            children: PropTypes.node,
            action: PropTypes.node,
            definitionKey: PropTypes.string,
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
        const link = this.getLink();

        let clonedChildren = null;
        if (this.props.children) {
            clonedChildren = (
                <ul className='nav nav__sub-menu subsections'>
                    {
                        React.Children.map(this.props.children, (child) => {
                            if (child === null) {
                                return null;
                            }

                            return React.cloneElement(child, {
                                parentLink: link,
                                subsection: true,
                            });
                        })
                    }
                </ul>
            );
        }

        let className = 'sidebar-section';
        if (this.props.subsection) {
            className += ' sidebar-subsection';
        }
        const sidebarItemSafeId = Utils.createSafeId(this.props.name);
        let sidebarItem = (
            <BlockableLink
                id={sidebarItemSafeId}
                className={`${className}-title`}
                activeClassName={`${className}-title ${className}-title--active`}
                to={link}
                onClick={() => trackEvent('admin', sidebarItemSafeId)}
            >
                <span className={`${className}-title__text`}>
                    {this.props.title}
                </span>
                {this.props.action}
            </BlockableLink>
        );

        if (this.props.type === 'text') {
            sidebarItem = (
                <div
                    className={`${className}-title`}
                >
                    <span className={`${className}-title__text`}>
                        {this.props.title}
                    </span>
                    {this.props.action}
                </div>
            );
        }

        return (
            <li
                className={className}
                data-testid={this.props.definitionKey}
            >
                {sidebarItem}
                {clonedChildren}
            </li>
        );
    }
}
