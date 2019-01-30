// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';

export default class BackstageHeader extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.node,
        };
    }
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    render() {
        const children = [];
        const {formatMessage} = this.context.intl;

        React.Children.forEach(this.props.children, (child, index) => {
            if (index !== 0) {
                children.push(
                    <span
                        key={'divider' + index}
                        className='backstage-header__divider'
                    >
                        <i
                            className='fa fa-angle-right'
                            title={formatMessage({id: 'generic_icons.breadcrumb', defaultMessage: 'Breadcrumb Icon'})}
                        />
                    </span>
                );
            }

            children.push(child);
        });

        return (
            <div className='backstage-header'>
                <h1>
                    {children}
                </h1>
            </div>
        );
    }
}
