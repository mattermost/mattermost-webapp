// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import Constants, {RHSStates} from 'utils/constants';

export default class RhsCardHeader extends React.PureComponent {
    static propTypes = {
        previousRhsState: PropTypes.oneOf(Object.values(RHSStates)),
        isExpanded: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            showMentions: PropTypes.func,
            showSearchResults: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            showPinnedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func,
            toggleRhsExpanded: PropTypes.func.isRequired,
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

    render() {
        let back;
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
                        defaultMessage='Back to saved posts'
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

        const closeSidebarTooltip = (
            <Tooltip id='closeSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.closeSidebarTooltip'
                    defaultMessage='Close'
                />
            </Tooltip>
        );

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
                    id='rhs_header.collapseSidebarTooltip'
                    defaultMessage='Collapse Sidebar'
                />
            </Tooltip>
        );

        if (backToResultsTooltip) {
            back = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={backToResultsTooltip}
                >
                    <a
                        href='#'
                        onClick={this.handleBack}
                        className='sidebar--right__back'
                    >
                        <FormattedMessage
                            id='generic_icons.back'
                            defaultMessage='Back Icon'
                        >
                            {(ariaLabel) => (
                                <i
                                    className='icon icon-arrow-back-ios'
                                    aria-label={ariaLabel}
                                />
                            )}
                        </FormattedMessage>
                    </a>
                </OverlayTrigger>
            );
        }

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>
                    {back}
                    <FormattedMessage
                        id='search_header.title5'
                        defaultMessage='Extra information'
                    />
                </span>
                <div className='pull-right'>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={this.props.isExpanded ? shrinkSidebarTooltip : expandSidebarTooltip}
                    >
                        <button
                            type='button'
                            className='sidebar--right__expand btn-icon'
                            aria-label='Expand'
                            onClick={this.props.actions.toggleRhsExpanded}
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
                            <FormattedMessage
                                id='rhs_header.collapseSidebarTooltip.icon'
                                defaultMessage='Collapse Sidebar Icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='icon icon-arrow-collapse'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={closeSidebarTooltip}
                    >
                        <button
                            type='button'
                            className='sidebar--right__close btn-icon'
                            aria-label='Close'
                            onClick={this.props.actions.closeRightHandSide}
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
                        </button>
                    </OverlayTrigger>
                </div>
            </div>
        );
    }
}
