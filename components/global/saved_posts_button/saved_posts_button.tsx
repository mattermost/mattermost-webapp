// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {closeRightHandSide, showFlaggedPosts} from 'actions/views/rhs';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import {RhsState} from 'types/store/rhs';
import Constants, {RHSStates} from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';

const SavedPostsButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const rhsState = useSelector<GlobalState, RhsState>((state: GlobalState) => getRhsState(state));
    const isRhsOpen = useSelector<GlobalState, boolean>((state: GlobalState) => getIsRhsOpen(state));

    const savedPostsButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(rhsState === RHSStates.FLAG ? closeRightHandSide() : showFlaggedPosts());
    };

    const tooltip = (
        <Tooltip id='recentMentions'>
            <FormattedMessage
                id='channel_header.flagged'
                defaultMessage='Saved posts'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={isRhsOpen ? <></> : tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'bookmark-outline'}
                toggled={rhsState === RHSStates.FLAG}
                onClick={savedPostsButtonClick}
                inverted={true}
                compact={true}
                aria-label='Select to toggle a list of saved posts.' // proper wording and translation needed
            />
        </OverlayTrigger>
    );
};

export default SavedPostsButton;
