// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LocalizedIcon from 'components/localized_icon';

import {t} from 'utils/i18n';

export default class BackstageHeader extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
    };

    render() {
        const children = [];

        React.Children.forEach(this.props.children, (child, index) => {
            if (index !== 0) {
                children.push(
                    <span
                        key={'divider' + index}
                        className='backstage-header__divider'
                    >
                        <LocalizedIcon
                            className='fa fa-angle-right'
                            title={{id: t('generic_icons.breadcrumb'), defaultMessage: 'Breadcrumb Icon'}}
                        />
                    </span>,
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
