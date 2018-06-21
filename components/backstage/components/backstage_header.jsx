// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class BackstageHeader extends React.Component {
    static get propTypes() {
        return {
            children: PropTypes.node,
        };
    }

    render() {
        const children = [];

        React.Children.forEach(this.props.children, (child, index) => {
            if (index !== 0) {
                children.push(
                    <span
                        key={'divider' + index}
                        className='backstage-header__divider'
                    >
                        <i
                            className='fa fa-angle-right'
                            title={localizeMessage('generic_icons.breadcrumb', 'Breadcrumb Icon')}
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
