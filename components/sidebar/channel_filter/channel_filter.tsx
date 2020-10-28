// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';
import OverlayTrigger from 'components/overlay_trigger';
import {localizeMessage} from 'utils/utils';

type Props = {
    hasMultipleTeams: boolean;
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
        const {unreadFilterEnabled, hasMultipleTeams} = this.props;

        let filterTitle = (
            <FormattedMessage
                id='sidebar_left.channel_filter.viewing'
                defaultMessage='VIEWING:'
            />
        );

        let filterDescription = (
            <FormattedMessage
                id='sidebar_left.channel_filter.allChannels'
                defaultMessage='All channels'
            />
        );

        let tooltipMessage = localizeMessage('sidebar_left.channel_filter.filterByUnread', 'Filter by unread');

        if (unreadFilterEnabled) {
            filterTitle = (
                <FormattedMessage
                    id='sidebar_left.channel_filter.filteredBy'
                    defaultMessage='FILTERED BY:'
                />
            );

            filterDescription = (
                <FormattedMessage
                    id='sidebar_left.channel_filter.unread'
                    defaultMessage='Unread'
                />
            );

            tooltipMessage = localizeMessage('sidebar_left.channel_filter.showAllChannels', 'Show all channels');
        }

        const tooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                {tooltipMessage}
            </Tooltip>
        );

        return (
            <div className='SidebarFilters'>
                <OverlayTrigger
                    delayShow={500}
                    placement={hasMultipleTeams ? 'top' : 'right'}
                    overlay={tooltip}
                >
                    <a
                        href='#'
                        className={classNames('SidebarFilters_filterButton', {
                            active: unreadFilterEnabled,
                        })}
                        onClick={this.toggleUnreadFilter}
                        aria-label={tooltipMessage}
                    >
                        <i className='icon icon-filter-variant'/>
                    </a>
                </OverlayTrigger>
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
