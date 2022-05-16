// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import Constants from 'utils/constants';
import {isMobileApp} from 'utils/user_agent';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from '../../keyboard_shortcuts/keyboard_shortcuts_sequence';

interface ShowFormatProps {
    onClick: (event: React.MouseEvent) => void;
    active: boolean;
}

export const ShowFormat = (props: ShowFormatProps): JSX.Element => {
    const {onClick, active} = props;
    if (isMobileApp()) {
        return <></>;
    }

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='left'
            trigger={['hover', 'focus']}
            overlay={
                <Tooltip id='PreviewInputTextButtonTooltip'>
                    <KeyboardShortcutSequence
                        shortcut={KEYBOARD_SHORTCUTS.msgMarkdownPreview}
                        hoistDescription={true}
                        isInsideTooltip={true}
                    />
                </Tooltip>
            }
        >
            <button
                type='button'
                id='PreviewInputTextButton'
                onClick={onClick}
                className={classNames('AdvancedTextEditor__action-button',
                    {'AdvancedTextEditor__action-button--active': active},
                )}
            >
                <i className='icon icon-eye-outline'/>
            </button>
        </OverlayTrigger>
    );
};
