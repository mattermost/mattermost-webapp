// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';

class BackstageHeader extends React.Component {
    static propTypes = {
        intl: PropTypes.any.isRequired,
        children: PropTypes.node,
    };

    render() {
        const children = [];
        const {formatMessage} = this.props.intl;

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

export default injectIntl(BackstageHeader);
