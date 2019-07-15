// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';

export default class SearchResultsHeader extends React.Component {
    static propTypes = {
        children: PropTypes.element,
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
                    defaultMessage='Close Sidebar'
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
                    id='rhs_header.shrinkSidebarTooltip'
                    defaultMessage='Shrink Sidebar'
                />
            </Tooltip>
        );

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>{this.props.children}</span>
                <div className='pull-right'>
                    <button
                        type='button'
                        className='sidebar--right__expand'
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
                                        className='fa fa-expand'
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
                                        className='fa fa-compress'
                                        aria-label={ariaLabel}
                                    />
                                )}
                            </FormattedMessage>
                        </OverlayTrigger>
                    </button>
                    <button
                        id='searchResultsCloseButton'
                        type='button'
                        className='sidebar--right__close'
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
                                        className='fa fa-sign-out'
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
