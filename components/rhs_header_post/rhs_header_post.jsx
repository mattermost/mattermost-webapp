// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import store from 'stores/redux_store.jsx';
import OverlayTrigger from 'components/overlay_trigger';

import Constants, {RHSStates} from 'utils/constants';
import { browserHistory } from 'utils/browser_history';

export default class RhsHeaderPost extends React.Component {
    static propTypes = {
        channel: PropTypes.object,
        previousRhsState: PropTypes.oneOf(
            Object.values(RHSStates)
        ),
        actions: PropTypes.shape({
            showMentions: PropTypes.func,
            showSearchResults: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            showPinnedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func,
            toggleRhsExpanded: PropTypes.func,
        }),
    };

    handleBack = (e) => {
        e.preventDefault();

        switch (this.props.previousRhsState) {
        case RHSStates.SEARCH:
            this.props.actions.showSearchResults();
            break;
        case RHSStates.MENTION:
            this.props.actions.showMentions();
            break;
        case RHSStates.FLAG:
            this.props.actions.showFlaggedPosts();
            break;
        case RHSStates.PIN:
            this.props.actions.showPinnedPosts();
            break;
        default:
            break;
        }
    }

    redirectToChannel = (e) => {
        const teamUrl = getCurrentRelativeTeamUrl(store.getState());
        browserHistory.push(`${teamUrl}/channels/${this.props.channel.name}`);
    }

    render() {
        let back;
        const closeSidebarTooltip = (
            <Tooltip id='closeSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.closeSidebarTooltip'
                    defaultMessage='Close Sidebar'
                />
            </Tooltip>
        );

        let backToResultsTooltip;

        switch (this.props.previousRhsState) {
        case RHSStates.SEARCH:
        case RHSStates.MENTION:
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToResultsTooltip'
                        defaultMessage='Back to search results'
                    />
                </Tooltip>
            );
            break;
        case RHSStates.FLAG:
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToFlaggedTooltip'
                        defaultMessage='Back to flagged posts'
                    />
                </Tooltip>
            );
            break;
        case RHSStates.PIN:
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToPinnedTooltip'
                        defaultMessage='Back to pinned posts'
                    />
                </Tooltip>
            );
            break;
        }

        const expandSidebarTooltip = (
            <Tooltip id='expandSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.expandSidebarTooltip'
                    defaultMessage='Expand Sidebar'
                />
            </Tooltip>
        );

        const shrinkSidebarTooltip = (
            <Tooltip id='shrinkSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.shrinkSidebarTooltip'
                    defaultMessage='Shrink Sidebar'
                />
            </Tooltip>
        );

        const channelName = this.props.channel.display_name;

        if (backToResultsTooltip) {
            back = (
                <a
                    href='#'
                    onClick={this.handleBack}
                    className='sidebar--right__back'
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={backToResultsTooltip}
                    >
                        <FormattedMessage
                            id='generic_icons.back'
                            defaultMessage='Back Icon'
                        >
                            {(ariaLabel) => (
                                <i
                                    className='fa fa-angle-left'
                                    aria-label={ariaLabel}
                                />
                            )}
                        </FormattedMessage>
                    </OverlayTrigger>
                </a>
            );
        }

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>
                    {back}
                    <FormattedMessage
                        id='rhs_header.details'
                        defaultMessage='Thread'
                    />
                    {channelName &&
                        <button
                            onClick={this.redirectToChannel}
                            className='style--none sidebar--right__title__channel'
                        >
                            {channelName}
                        </button>
                    }
                </span>
                <div className='pull-right'>
                    <button
                        type='button'
                        className='sidebar--right__expand btn-icon'
                        aria-label='Expand'
                        onClick={this.props.actions.toggleRhsExpanded}
                    >
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={expandSidebarTooltip}
                        >
                            <FormattedMessage
                                id='rhs_header.expandSidebarTooltip.icon'
                                defaultMessage='Expand Sidebar Icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='icon icon-arrow-expand'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                        </OverlayTrigger>
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={shrinkSidebarTooltip}
                        >
                            <FormattedMessage
                                id='rhs_header.expandTooltip.icon'
                                defaultMessage='Shrink Sidebar Icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='icon icon-arrow-collapse'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                        </OverlayTrigger>
                    </button>
                    <button
                        id='rhsCloseButton'
                        type='button'
                        className='sidebar--right__close btn-icon'
                        aria-label='Close'
                        onClick={this.props.actions.closeRightHandSide}
                    >

                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={closeSidebarTooltip}
                        >
                            <FormattedMessage
                                id='rhs_header.closeTooltip.icon'
                                defaultMessage='Close Sidebar Icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='icon icon-close'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                        </OverlayTrigger>
                    </button>
                </div>
            </div>
        );
    }
}
