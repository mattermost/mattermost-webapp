// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';

export default class RhsHeaderPost extends React.Component {
    static propTypes = {
        isWebrtc: PropTypes.bool,
        fromSearch: PropTypes.bool,
        fromFlaggedPosts: PropTypes.bool,
        fromPinnedPosts: PropTypes.bool,
        fromMentions: PropTypes.bool,
        toggleSize: PropTypes.func,
        shrink: PropTypes.func,
        actions: PropTypes.shape({
            showMentions: PropTypes.func,
            showSearchResults: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            showPinnedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func
        })
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    handleClose = (e) => {
        e.preventDefault();
        this.props.actions.closeRightHandSide();
        this.props.shrink();
    }

    toggleSize = (e) => {
        e.preventDefault();
        this.props.toggleSize();
    }

    handleBack = (e) => {
        e.preventDefault();

        if (this.props.fromSearch || this.props.fromMentions || this.props.isWebrtc) {
            if (this.props.fromMentions) {
                this.props.actions.showMentions();
            } else {
                this.props.actions.showSearchResults();
            }
        } else if (this.props.fromFlaggedPosts) {
            this.props.actions.showFlaggedPosts();
        } else if (this.props.fromPinnedPosts) {
            this.props.actions.showPinnedPosts();
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
        if (this.props.fromSearch || this.props.fromMentions) {
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToResultsTooltip'
                        defaultMessage='Back to Search Results'
                    />
                </Tooltip>
            );
        } else if (this.props.fromFlaggedPosts) {
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToFlaggedTooltip'
                        defaultMessage='Back to Flagged Posts'
                    />
                </Tooltip>
            );
        } else if (this.props.isWebrtc) {
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToCallTooltip'
                        defaultMessage='Back to Call'
                    />
                </Tooltip>
            );
        } else if (this.props.fromPinnedPosts) {
            backToResultsTooltip = (
                <Tooltip id='backToResultsTooltip'>
                    <FormattedMessage
                        id='rhs_header.backToPinnedTooltip'
                        defaultMessage='Back to Pinned Posts'
                    />
                </Tooltip>
            );
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

        if (this.props.fromMentions || this.props.fromSearch || this.props.fromFlaggedPosts || this.props.isWebrtc || this.props.fromPinnedPosts) {
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
                        <i className='fa fa-angle-left'/>
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
                        onClick={this.toggleSize}
                    >
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={expandSidebarTooltip}
                        >
                            <i className='fa fa-expand'/>
                        </OverlayTrigger>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={shrinkSidebarTooltip}
                        >
                            <i className='fa fa-compress'/>
                        </OverlayTrigger>
                    </button>
                    <button
                        type='button'
                        className='sidebar--right__close'
                        aria-label='Close'
                        onClick={this.handleClose}
                    >

                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={closeSidebarTooltip}
                        >
                            <i className='fa fa-sign-out'/>
                        </OverlayTrigger>
                    </button>
                </div>
            </div>
        );
    }
}
