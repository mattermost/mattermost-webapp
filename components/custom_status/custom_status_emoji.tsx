// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {makeGetCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    spanStyle?: React.CSSProperties;
    emojiStyle?: React.CSSProperties;
    userID?: string;
    onClick?: () => void;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const getCustomStatus = makeGetCustomStatus();
    const {emojiSize, emojiStyle, spanStyle, showTooltip, tooltipDirection, userID, onClick} = props;
    const customStatusEnabled = useSelector(isCustomStatusEnabled);
    const customStatus = useSelector((state: GlobalState) => {
        return getCustomStatus(state, userID);
    });
    if (!(customStatusEnabled && customStatus && customStatus.emoji)) {
        return null;
    }

    const statusEmoji = (
        <RenderEmoji
            emojiName={customStatus.emoji}
            size={emojiSize}
            emojiStyle={emojiStyle}
            onClick={onClick}
        />
    );

    if (!showTooltip) {
        return statusEmoji;
    }

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement={tooltipDirection}
            overlay={
                <Tooltip id='custom-status-tooltip'>
                    <div className='custom-status'>
                        <RenderEmoji
                            emojiName={customStatus.emoji}
                            size={14}
                            emojiStyle={{
                                marginTop: 2,
                            }}
                        />
                        <span
                            className='custom-status-text'
                            style={{marginLeft: 5}}
                        >
                            {customStatus.text}
                        </span>
                    </div>
                </Tooltip>
            }
        >
            <span style={spanStyle}>
                {statusEmoji}
            </span>
        </OverlayTrigger>
    );
};

CustomStatusEmoji.defaultProps = {
    userID: '',
    emojiSize: 16,
    tooltipDirection: 'top',
    showTooltip: false,
    spanStyle: {},
    emojiStyle: {
        marginLeft: 4,
    },
};

export default CustomStatusEmoji;
