// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import OverlayTrigger from 'components/overlay_trigger';
import Constants, {RHSStates} from 'utils/constants';

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    isRhsOpen: boolean;
    actions: {
        showFlaggedPosts: () => void;
        closeRightHandSide: () => void;
    };
};

const SavedPostsButton = (props: Props): JSX.Element | null => {
    const {rhsState, isRhsOpen, actions: {closeRightHandSide, showFlaggedPosts}} = props;

    const savedPostsButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.FLAG) {
            closeRightHandSide();
        } else {
            showFlaggedPosts();
        }
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
