// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useMemo} from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {CustomStatusDuration} from 'mattermost-redux/types/users';
import {getCurrentUserTimezone} from 'selectors/general';
import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

import ExpiryTime from './expiry_time';

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
    const getCustomStatus = useMemo(makeGetCustomStatus, []);
    const {emojiSize, emojiStyle, spanStyle, showTooltip, tooltipDirection, userID, onClick} = props;

    const customStatusEnabled = useSelector(isCustomStatusEnabled);
    const customStatus = useSelector((state: GlobalState) => getCustomStatus(state, userID));
    const customStatusExpired = useSelector((state: GlobalState) => isCustomStatusExpired(state, customStatus));
    const timezone = useSelector(getCurrentUserTimezone);

    const isCustomStatusSet = Boolean(customStatusEnabled && customStatus?.emoji && !customStatusExpired);
    if (!isCustomStatusSet) {
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
                        {customStatus.text &&
                            <span
                                className='custom-status-text'
                                style={{marginLeft: 5}}
                            >
                                {customStatus.text}
                            </span>
                        }
                    </div>
                    {customStatus.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR &&
                        <div>
                            <ExpiryTime
                                time={customStatus.expires_at}
                                timezone={timezone}
                                className='custom-status-expiry'
                            />
                        </div>
                    }
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
