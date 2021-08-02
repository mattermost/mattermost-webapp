// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import IconButton from '@mattermost/compass-components/components/icon-button';

import Constants, {RHSStates} from 'utils/constants';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    isRhsOpen?: boolean;
    actions: {
        showMentions: () => void;
        closeRightHandSide: () => void;
    };
};

const AtMentionsButton = (props: Props): JSX.Element => {
    const {rhsState, isRhsOpen, actions: {closeRightHandSide, showMentions}} = props;

    const mentionButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.MENTION) {
            closeRightHandSide();
        } else {
            showMentions();
        }
    };

    const tooltip = (
        <Tooltip id='recentMentions'>
            <FormattedMessage
                id='channel_header.recentMentions'
                defaultMessage='Recent mentions'
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
                icon={'at'}
                toggled={rhsState === RHSStates.MENTION}
                onClick={mentionButtonClick}
                inverted={true}
                compact={true}
                aria-label='Select to toggle a list of recent mentions.' // proper wording and translation needed
            />
        </OverlayTrigger>
    );
};

export default AtMentionsButton;
