// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {Tooltip} from 'react-bootstrap';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {trackEvent} from 'actions/telemetry_actions';
import * as Utils from 'utils/utils';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';
import KeyboardShortcutSequence, {
    KEYBOARD_SHORTCUTS,
    KeyboardShortcutDescriptor,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';

const HistoryButtonsContainer = styled.nav`
    display: flex;
    align-items: center;

    > :first-child {
           margin-right: 1px;
    }
`;

const HistoryButtons = (): JSX.Element => {
    const getTooltip = (shortcut: KeyboardShortcutDescriptor) => (
        <Tooltip
            id='upload-tooltip'
        >
            <KeyboardShortcutSequence
                shortcut={shortcut}
                hoistDescription={true}
                isInsideTooltip={true}
            />
        </Tooltip>
    );
    const goBack = () => {
        trackEvent('ui', 'ui_history_back');
        browserHistory.goBack();
    };

    const goForward = () => {
        trackEvent('ui', 'ui_history_forward');
        browserHistory.goForward();
    };

    return (
        <HistoryButtonsContainer>
            <OverlayTrigger
                trigger={['hover']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={getTooltip(KEYBOARD_SHORTCUTS.browserChannelPrev)}
            >
                <IconButton
                    icon={'arrow-left'}
                    onClick={goBack}
                    size={'sm'}
                    compact={true}
                    inverted={true}
                    aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goBackLabel', 'Back')}
                />
            </OverlayTrigger>
            <OverlayTrigger
                trigger={['hover']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={getTooltip(KEYBOARD_SHORTCUTS.browserChannelNext)}
            >
                <IconButton
                    icon={'arrow-right'}
                    onClick={goForward}
                    size={'sm'}
                    compact={true}
                    inverted={true}
                    aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goForwardLabel', 'Forward')}
                />
            </OverlayTrigger>
        </HistoryButtonsContainer>
    );
};

export default HistoryButtons;
