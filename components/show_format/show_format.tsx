// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Constants from 'utils/constants';
import {isMobileApp} from 'utils/user_agent';

import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

interface ShowFormatProps {
    onClick?: (event: React.MouseEvent) => void;
}

export const ShowFormat = (props: ShowFormatProps): JSX.Element => {
    const {onClick} = props;
    if (isMobileApp()) {
        return <></>;
    }

    return (
        <OverlayTrigger
            onClick={onClick}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            trigger='hover'
            overlay={
                <Tooltip id='upload-tooltip'>
                    <KeyboardShortcutSequence
                        shortcut={KEYBOARD_SHORTCUTS.filesUpload}
                        hoistDescription={true}
                        isInsideTooltip={true}
                    />
                </Tooltip>
            }
        >
            <div className={'style--none'}>
                <div>
                    <button
                        type='button'
                        id='fileUploadButton'
                        className='style--none post-action icon icon--attachment'
                    >
                        <i className='icon icon-eye-outline'/>
                    </button>
                    <input
                        id='fileUploadInput'
                        tabIndex={-1}
                        type='file'
                    />
                </div>
            </div>
        </OverlayTrigger>
    );
};
