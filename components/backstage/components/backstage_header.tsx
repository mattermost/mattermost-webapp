// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import LocalizedIcon from 'components/localized_icon';

import {t} from 'utils/i18n';

type Props = {
    children?: React.ReactNode[];
};

export default class BackstageHeader extends React.PureComponent<Props> {
    render(): React.ReactNode {
        const children: React.ReactNode[] = [];

        React.Children.forEach(this.props.children, (child, index) => {
            if (index !== 0) {
                children.push(
                    <span
                        // eslint-disable-next-line react/no-array-index-key
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
