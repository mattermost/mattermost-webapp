// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
    unreadFilterEnabled: boolean;
};

type State = {

};

export default class ChannelFilter extends React.PureComponent<Props, State> {
    render() {
        const {unreadFilterEnabled} = this.props;

        let filterTitle = (
            <FormattedMessage
                id='sidebar_left.channel_filter.viewing'
                defaultMessage='VIEWING:'
            />
        );

        if (unreadFilterEnabled) {
            filterTitle = (
                <FormattedMessage
                    id='sidebar_left.channel_filter.filteredBy'
                    defaultMessage='FILTERED BY:'
                />
            );
        }

        let filterDescription = (
            <FormattedMessage
                id='sidebar_left.channel_filter.allChannels'
                defaultMessage='All channels'
            />
        );

        if (unreadFilterEnabled) {
            filterDescription = (
                <FormattedMessage
                    id='sidebar_left.channel_filter.unread'
                    defaultMessage='Unread'
                />
            );
        }

        return (
            <div className='SidebarFilters'>
                <a
                    href='#'
                    className='SidebarFilters_filterButton'
                >
                    <i className='icon icon-filter-variant'/>
                </a>
                <div>
                    <div>
                        {filterTitle}
                    </div>
                    <div>
                        {filterDescription}
                    </div>
                </div>
            </div>
        );
    }
}
