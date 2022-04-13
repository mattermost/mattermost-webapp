// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import Constants from '../../utils/constants';
import OverlayTrigger from '../overlay_trigger';
import Tooltip from '../tooltip';

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
    active: boolean;
}

export const ToggleFormattingBar = (props: ToggleFormattingBarProps): JSX.Element => {
    const {onClick, active} = props;
    return (
        <div>
            <OverlayTrigger
                onClick={onClick}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                trigger='hover'
                overlay={<Tooltip id='toggleFormattingBarButtonTooltip'>
                    <div aria-hidden={true}>
                        <FormattedMessage
                            id='advance_text_editor.show_formatting_bar'
                            defaultMessage='Show Formatting Tools'
                        />
                    </div>
                </Tooltip>}
            >
                <button
                    type='button'
                    id='toggleFormattingBarButton'
                    onClick={onClick}
                    className={classNames('post-action',
                        {'post-action--active': active},
                    )}
                >
                    <i className='icon icon-format-letter-case'/>
                </button>
            </OverlayTrigger>
        </div>
    );
};
