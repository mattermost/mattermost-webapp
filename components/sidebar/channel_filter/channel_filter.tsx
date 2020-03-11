// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {trackEvent} from 'actions/diagnostics_actions';

type Props = {
    unreadFilterEnabled: boolean;
    actions: {
        setUnreadFilterEnabled: (enabled: boolean) => void;
    };
};

type State = {

};

export default class ChannelFilter extends React.PureComponent<Props, State> {
    toggleUnreadFilter = () => {
        const {unreadFilterEnabled} = this.props;

        if (unreadFilterEnabled) {
            trackEvent('ui', 'ui_sidebar_unread_filter_disabled');
        } else {
            trackEvent('ui', 'ui_sidebar_unread_filter_enabled');
        }

        this.props.actions.setUnreadFilterEnabled(!unreadFilterEnabled);
    }

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
                    className={classNames('SidebarFilters_filterButton', {
                        active: unreadFilterEnabled,
                    })}
                    onClick={this.toggleUnreadFilter}
                >
                    <i className='icon icon-filter-variant'/>
                </a>
                <div>
                    <div className='SidebarFilters_filterTitle'>
                        {filterTitle}
                    </div>
                    <div className='SidebarFilters_filterDescription'>
                        {filterDescription}
                    </div>
                </div>
            </div>
        );
    }
}
