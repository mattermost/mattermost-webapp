// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {EyeOutlineIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from '../../keyboard_shortcuts/keyboard_shortcuts_sequence';

interface ShowFormatProps {
    onClick: (event: React.MouseEvent) => void;
    active: boolean;
}

export const ShowFormat = (props: ShowFormatProps): JSX.Element => {
    const {formatMessage} = useIntl();
    const {onClick, active} = props;
    const iconAriaLabel = formatMessage({id: 'generic_icons.format_letter_case', defaultMessage: 'Format letter Case Icon'});

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
                <EyeOutlineIcon
                    size={18}
                    color={'currentColor'}
                    aria-label={iconAriaLabel}
                />
            </button>
        </OverlayTrigger>
    );
};
