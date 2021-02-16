// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {Tooltip} from 'react-bootstrap';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants';
import RenderEmoji from 'components/emoji/render_emoji';

import CustomStatusText from './custom_status_text';

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

    const showClearButton = () => setShow(true);

    const hideClearButton = () => setShow(false);

    const handleRecentCustomStatusClear = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (handleClear) {
            handleClear({
                emoji,
                text,
            });
        }
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
                    <button
                        className='style--none input-clear-x'
                        onClick={handleRecentCustomStatusClear}
                    >
                        <i className='icon icon-close-circle'/>
                    </button>
                </OverlayTrigger>
            </div>
        ) : null;

    return (
        <div
            className='statusSuggestion__row cursor--pointer'
            onMouseEnter={showClearButton}
            onMouseLeave={hideClearButton}
            onClick={() => handleSuggestionClick({emoji, text})}
        >
            <div className='statusSuggestion__icon'>
                <RenderEmoji
                    emojiName={emoji}
                    size={20}
                />
            </div>
            <CustomStatusText
                text={text}
                tooltipDirection='top'
                className='statusSuggestion__text'
            />
            {show && clearButton}
        </div>
    );
};

export default CustomStatusSuggestion;
