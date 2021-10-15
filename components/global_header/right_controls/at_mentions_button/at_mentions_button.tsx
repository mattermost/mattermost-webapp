// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {closeRightHandSide, showMentions} from 'actions/views/rhs';
import OverlayTrigger from 'components/overlay_trigger';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import Constants, {RHSStates} from 'utils/constants';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

const AtMentionsButton = (): JSX.Element => {
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    const isRhsOpen = useSelector((state: GlobalState) => getIsRhsOpen(state));

    const mentionButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.MENTION) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showMentions());
        }
    };

    const tooltip = (
        <Tooltip id='recentMentions'>
            <FormattedMessage
                id='channel_header.recentMentions'
                defaultMessage='Recent mentions'
            />
            <KeyboardShortcutSequence
                shortcut={KEYBOARD_SHORTCUTS.navMentions}
                hideDescription={true}
                isInsideTooltip={true}
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
