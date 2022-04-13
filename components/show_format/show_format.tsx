// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import {isMobileApp} from 'utils/user_agent';

import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

interface ShowFormatProps {
    onClick?: (event: React.MouseEvent) => void;
    active: boolean;
}

export const ShowFormat = (props: ShowFormatProps): JSX.Element => {
    const {onClick, active} = props;
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
                <Tooltip id='PreviewInputTextButtonTooltip'>
                    <div aria-hidden={true}>
                        <FormattedMessage
                            id='advance_text_editor.preview'
                            defaultMessage='Preview'
                        />
                    </div>
                </Tooltip>
            }
        >
            <div className={'style--none'}>
                <div>
                    <button
                        type='button'
                        id='PreviewInputTextButton'
                        onClick={onClick}
                        className={classNames('post-action',
                            {'post-action--active': active},
                        )}
                    >
                        <i className='icon icon-eye-outline'/>
                    </button>
                </div>
            </div>
        </OverlayTrigger>
    );
};
