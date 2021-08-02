// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    actions: {
        showFlaggedPosts: () => void;
        closeRightHandSide: () => void;
    };
};

const SavedPostsButton = (props: Props): JSX.Element | null => {
    const {rhsState, actions: {closeRightHandSide, showFlaggedPosts}} = props;

    const savedPostsButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.FLAG) {
            closeRightHandSide();
        } else {
            showFlaggedPosts();
        }
    };

    return (
        // tool tip needed
        <IconButton
            size={'sm'}
            icon={'bookmark-outline'}
            toggled={rhsState === RHSStates.FLAG}
            onClick={savedPostsButtonClick}
            inverted={true}
            compact={true}
            aria-label='Select to toggle a list of saved posts.' // proper wording and translation needed
        />
    );
};

export default SavedPostsButton;
