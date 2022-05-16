// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
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

const ShowFormat = (props: ShowFormatProps): JSX.Element => {
    const {formatMessage} = useIntl();
    const {onClick, active} = props;
    const iconAriaLabel = formatMessage({id: 'generic_icons.format_letter_case', defaultMessage: 'Format letter Case Icon'});

    const tooltip = (
        <Tooltip id='PreviewInputTextButtonTooltip'>
            <KeyboardShortcutSequence
                shortcut={KEYBOARD_SHORTCUTS.msgMarkdownPreview}
                hoistDescription={true}
                isInsideTooltip={true}
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement='left'
            delayShow={Constants.OVERLAY_TIME_DELAY}
            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
            overlay={tooltip}
        >
            <button
                type='button'
                id='PreviewInputTextButton'
                onClick={onClick}
                className={classNames({active})}
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

export default memo(ShowFormat);
