// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';

export default class SearchResultsHeader extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        isExpanded: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            closeRightHandSide: PropTypes.func,
            toggleRhsExpanded: PropTypes.func.isRequired,
        }),
    };

    render() {
        const closeSidebarTooltip = (
            <Tooltip id='closeSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.closeSidebarTooltip'
                    defaultMessage='Close the sidebar'
                />
            </Tooltip>
        );

        const expandSidebarTooltip = (
            <Tooltip id='expandSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.expandSidebarTooltip'
                    defaultMessage='Expand the sidebar'
                />
            </Tooltip>
        );

        const shrinkSidebarTooltip = (
            <Tooltip id='shrinkSidebarTooltip'>
                <FormattedMessage
                    id='rhs_header.shrinkSidebarTooltip'
                    defaultMessage='Shrink the sidebar'
                />
            </Tooltip>
        );

        let toggleSidebarTooltip;

        if (this.props.isExpanded) {
            toggleSidebarTooltip = shrinkSidebarTooltip;
        } else {
            toggleSidebarTooltip = expandSidebarTooltip;
        }

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>{this.props.children}</span>
                <div className='pull-right'>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={toggleSidebarTooltip}
                    >
                        <button
                            type='button'
                            className='sidebar--right__expand'
                            aria-label='Expand'
                            onClick={this.props.actions.toggleRhsExpanded}
                        >
                            <FormattedMessage
                                id='rhs_header.expandSidebarTooltip.icon'
                                defaultMessage='Expand the sidebar icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='fa fa-expand'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                            <FormattedMessage
                                id='rhs_header.expandTooltip.icon'
                                defaultMessage='Shrink the sidebar icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='fa fa-compress'
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
                            id='searchResultsCloseButton'
                            type='button'
                            className='sidebar--right__close'
                            aria-label='Close'
                            onClick={this.props.actions.closeRightHandSide}
                        >
                            <FormattedMessage
                                id='rhs_header.closeTooltip.icon'
                                defaultMessage='Close the sidebar icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='fa fa-sign-out'
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
