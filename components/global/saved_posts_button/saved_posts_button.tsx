// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

const SavedPostsButton = (): JSX.Element | null => {
    const rhsState = useSelector(getRhsState);

    return (
        // tool tip needed
        <IconButton
            size={'sm'}
            icon={'bookmark-outline'}
            toggled={rhsState === RHSStates.FLAG}
            onClick={(): void => {}} // currently needed to keep button from being disabled
            inverted={true}
            compact={true}
            aria-label='Select to toggle a list of saved posts.' // proper wording and translation needed
        />
    );
};

export default SavedPostsButton;
