// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants, {RHSStates} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export default class RhsHeaderPost extends React.Component {
    static propTypes = {
        isWebrtc: PropTypes.bool,
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

        if (this.props.isWebrtc) {
            this.props.actions.showSearchResults();
            return;
        }

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
                        defaultMessage='Back to Search Results'
                    />
                </Tooltip>
            );
            break;
        case RHSStates.FLAG:
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToFlaggedTooltip'
                        defaultMessage='Back to Flagged Posts'
                    />
                </Tooltip>
            );
            break;
        case RHSStates.PIN:
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToPinnedTooltip'
                        defaultMessage='Back to Pinned Posts'
                    />
                </Tooltip>
            );
            break;
        default:
            if (this.props.isWebrtc) {
                backToResultsTooltip = (
                    <Tooltip id='backToResultsTooltip'>
                        <FormattedMessage
                            id='rhs_header.backToCallTooltip'
                            defaultMessage='Back to Call'
                        />
                    </Tooltip>
                );
            }
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

        if (backToResultsTooltip) {
            back = (
                <a
                    href='#'
                    onClick={this.handleBack}
                    className='sidebar--right__back'
                >
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={backToResultsTooltip}
                    >
                        <i
                            className='fa fa-angle-left'
                            title={localizeMessage('generic_icons.back', 'Back Icon')}
                        />
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
                        defaultMessage='Message Details'
                    />
                </span>
                <div className='pull-right'>
                    <button
                        type='button'
                        className='sidebar--right__expand'
                        aria-label='Expand'
                        onClick={this.props.actions.toggleRhsExpanded}
                    >
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={expandSidebarTooltip}
                        >
                            <i
                                className='fa fa-expand'
                                title={localizeMessage('rhs_header.expandSidebarTooltip.icon', 'Expand Sidebar Icon')}
                            />
                        </OverlayTrigger>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={shrinkSidebarTooltip}
                        >
                            <i
                                className='fa fa-compress'
                                title={localizeMessage('rhs_header.expandTooltip.icon', 'Shrink Sidebar Icon')}
                            />
                        </OverlayTrigger>
                    </button>
                    <button
                        type='button'
                        className='sidebar--right__close'
                        aria-label='Close'
                        onClick={this.props.actions.closeRightHandSide}
                    >

                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={closeSidebarTooltip}
                        >
                            <i
                                className='fa fa-sign-out'
                                title={localizeMessage('rhs_header.closeTooltip.icon', 'Close Sidebar Icon')}
                            />
                        </OverlayTrigger>
                    </button>
                </div>
            </div>
        );
    }
}
