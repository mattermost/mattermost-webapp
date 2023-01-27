// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {useDispatch, useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {RHSStates} from 'utils/constants';

import {closeRightHandSide, showRecentlyViewedPosts} from 'actions/views/rhs';

import {getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store';

const RecentlyViewedPostsButton = (): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));

    const savedPostsButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.RECENT) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showRecentlyViewedPosts());
        }
    };

    const tooltip = (
        <Tooltip id='recentMentions'>
            <FormattedMessage
                id='channel_header.history'
                defaultMessage='Recently viewed posts'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'clock-outline'}
                onClick={savedPostsButtonClick}
                inverted={true}
                compact={true}
                aria-haspopup='dialog'
                aria-label={formatMessage({id: 'global_header.history', defaultMessage: 'Recently viewed posts'})}
            />
        </OverlayTrigger>
    );
};

export default RecentlyViewedPostsButton;
