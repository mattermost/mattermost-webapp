// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {RHSStates} from 'utils/constants';

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    actions: {
        showMentions: () => void;
        closeRightHandSide: () => void;
    };
};

const AtMentionsButton = (props: Props): JSX.Element => {
    const {rhsState, actions: {closeRightHandSide, showMentions}} = props;

    const mentionButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.MENTION) {
            closeRightHandSide();
        } else {
            showMentions();
        }
    };

    return (
        // tool tip needed
        <IconButton
            size={'sm'}
            icon={'at'}
            toggled={rhsState === RHSStates.MENTION}
            onClick={mentionButtonClick}
            inverted={true}
            compact={true}
            aria-label='Select to toggle a list of recent mentions.' // proper wording and translation needed
        />
    );
};

export default AtMentionsButton;
