// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import Constants from 'utils/constants';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from '../../keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
    active: boolean;
}

export const ToggleFormattingBar = (props: ToggleFormattingBarProps): JSX.Element => {
    const {onClick, active} = props;
    return (
        <OverlayTrigger
            onClick={onClick}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            trigger={['hover', 'focus']}
            overlay={<Tooltip id='toggleFormattingBarButtonTooltip'>
                <KeyboardShortcutSequence
                    shortcut={KEYBOARD_SHORTCUTS.msgShowFormatting}
                    hoistDescription={true}
                    isInsideTooltip={true}
                />
            </Tooltip>}
        >
            <button
                type='button'
                id='toggleFormattingBarButton'
                onClick={onClick}
                className={classNames('adv-txt-editor__action-button',
                    {'adv-txt-editor__action-button--active': active},
                )}
            >
                <i className='icon icon-format-letter-case'/>
            </button>
        </OverlayTrigger>
    );
};
