// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState, useRef} from 'react';
import {Tooltip} from 'react-bootstrap';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants';
import RenderEmoji from 'components/emoji/render_emoji';

import './custom_status.scss';

type Props = {
    handleSuggestionClick: (status: UserCustomStatus) => void;
    emoji: string;
    text: string;
    handleClear?: (status: UserCustomStatus) => void;
};

const CustomStatusSuggestion: React.FC<Props> = (props: Props) => {
    const {handleSuggestionClick, emoji, text, handleClear} = props;
    const [show, setShow] = useState(false);
    const textRef = useRef(null);

    const showClearButton = () => {
        setShow(true);
    };

    const hideClearButton = () => {
        setShow(false);
    };

    const handleRecentCustomStatusClear = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (handleClear) {
            handleClear({
                emoji,
                text,
            });
        }
    };

    const showTextTooltip = () => {
        const element = textRef.current;
        return element && element.offsetWidth < element.scrollWidth;
    };

    const clearButton = handleClear ?
        (
            <div
                className='suggestion-clear'
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={
                        <Tooltip id='clear-recent-custom-status'>
                            {'Clear'}
                        </Tooltip>
                    }
                >
                    <span
                        className='input-clear-x'
                        onClick={handleRecentCustomStatusClear}
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        ) : null;

    let customStatusText = (
        <span
            className='statusSuggestion__text'
            ref={textRef}
        >
            {text}
        </span>
    );

    if (showTextTooltip()) {
        customStatusText = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip id='custom-status-text'>
                        {text}
                    </Tooltip>
                }
            >
                {customStatusText}
            </OverlayTrigger>
        );
    }

    return (
        <div
            className='statusSuggestion__row cursor--pointer a11y--active'
            onMouseEnter={showClearButton}
            onMouseLeave={hideClearButton}
            onClick={
                () => handleSuggestionClick(
                    {
                        emoji,
                        text,
                    })
            }
        >
            <div className='statusSuggestion__icon'>
                <RenderEmoji
                    emoji={emoji}
                    size={20}
                />
            </div>
            {customStatusText}
            {show && clearButton}
        </div>
    );
};

export default CustomStatusSuggestion;
