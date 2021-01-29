// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {getCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import Markdown from 'components/markdown/markdown';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    emojiStyle?: React.CSSProperties;
    userID?: string;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const {emojiSize, emojiStyle, showTooltip, tooltipDirection, userID} = props;
    const customStatusEnabled = useSelector((state: GlobalState) => {
        return isCustomStatusEnabled(state);
    });
    const customStatus = useSelector((state: GlobalState) => {
        return getCustomStatus(state, userID);
    });
    if (!(customStatusEnabled && customStatus && customStatus.emoji)) {
        return null;
    }

    const statusEmoji = (
        <RenderEmoji
            emoji={customStatus.emoji}
            size={emojiSize}
            emojiStyle={emojiStyle}
        />
    );

    let status = statusEmoji;
    if (showTooltip) {
        status = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={tooltipDirection}
                overlay={
                    <Tooltip id='custom-status-tooltip'>
                        <div className='custom-status'>
                            <RenderEmoji
                                emoji={customStatus.emoji}
                                size={14}
                            />
                            {' '}
                            <span className='custom-status-text'>
                                <Markdown
                                    message={customStatus.text}
                                    enableFormatting={true}
                                />
                            </span>
                        </div>
                    </Tooltip>
                }
            >
                <span>
                    {statusEmoji}
                </span>
            </OverlayTrigger>
        );
    }

    return status;
};

CustomStatusEmoji.defaultProps = {
    userID: '',
    emojiSize: 16,
    tooltipDirection: 'top',
    showTooltip: false,
    emojiStyle: {},
};

export default CustomStatusEmoji;
