// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import LocalizedIcon from 'components/localized_icon';
import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {t} from 'utils/i18n';

type Props = {
    isExpanded: boolean;
    children?: React.ReactNode;
    actions: {
        closeRightHandSide: () => void;
        toggleRhsExpanded: () => void;
    };
};

export default class SearchResultsHeader extends React.PureComponent<Props> {
    render(): React.ReactNode {
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

        return (
            <div className='sidebar--right__header'>
                <span className='sidebar--right__title'>{this.props.children}</span>
                <div className='pull-right'>
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
                            <LocalizedIcon
                                className='icon icon-arrow-expand'
                                ariaLabel={{id: t('rhs_header.expandSidebarTooltip.icon'), defaultMessage: 'Expand Sidebar Icon'}}
                            />
                            <LocalizedIcon
                                className='icon icon-arrow-collapse'
                                ariaLabel={{id: t('rhs_header.collapseSidebarTooltip.icon'), defaultMessage: 'Collapse Sidebar Icon'}}
                            />
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
                            <LocalizedIcon
                                className='icon icon-close'
                                ariaLabel={{id: t('rhs_header.closeTooltip.icon'), defaultMessage: 'Close Sidebar Icon'}}
                            />
                        </button>
                    </OverlayTrigger>
                </div>
            </div>
        );
    }
}
