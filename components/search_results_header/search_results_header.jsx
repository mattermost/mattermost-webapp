// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {generateId} from 'utils/utils';

export default class SearchResultsHeader extends React.PureComponent {
    static propTypes = {
        isExpanded: PropTypes.bool.isRequired,
        children: PropTypes.node,
        icons: PropTypes.arrayOf(PropTypes.shape({
            icon: PropTypes.node.isRequired,
            tooltip: PropTypes.node.isRequired,
            action: PropTypes.func.isRequired,
        })),
        actions: PropTypes.shape({
            closeRightHandSide: PropTypes.func.isRequired,
            toggleRhsExpanded: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        icons: [],
    }

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

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>{this.props.children}</span>
                <div className='pull-right'>
                    {
                        this.props.icons.map(
                            (icon) => {
                                const id = generateId();
                                return (
                                    <OverlayTrigger
                                        key={id}
                                        delayShow={Constants.OVERLAY_TIME_DELAY}
                                        placement='top'
                                        overlay={<Tooltip id={id}>{icon.tooltip}</Tooltip>}
                                    >
                                        <button
                                            id={id}
                                            type='button'
                                            className='sidebar--right__expand btn-icon'
                                            onClick={() => {
                                                if (icon.action) {
                                                    icon.action();
                                                }
                                            }}
                                        >
                                            {icon.icon}
                                        </button>
                                    </OverlayTrigger>
                                );
                            })
                    }
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={this.props.isExpanded ? shrinkSidebarTooltip : expandSidebarTooltip}
                    >
                        <button
                            type='button'
                            className='sidebar--right__expand btn-icon'
                            onClick={this.props.actions.toggleRhsExpanded}
                        >
                            <FormattedMessage
                                id='rhs_header.expandSidebarTooltip.icon'
                                defaultMessage='Expand the sidebar icon'
                            >
                                {(ariaLabel) => (
                                    <i
                                        className='icon icon-arrow-expand'
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
                            id='searchResultsCloseButton'
                            type='button'
                            className='sidebar--right__close btn-icon'
                            aria-label='Close'
                            onClick={this.props.actions.closeRightHandSide}
                        >
                            <FormattedMessage
                                id='rhs_header.closeTooltip.icon'
                                defaultMessage='Close the sidebar icon'
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
