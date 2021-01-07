// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';
import messageHtmlToComponent from 'utils/message_html_to_component';
import Constants from 'utils/constants';
import {CustomStatus} from 'types/store/custom_status';

import './custom_status.scss';

type Props = {
    handleSuggestionClick: (status: CustomStatus) => void;
    emoji: string;
    text: string;
    handleClear? : (status: CustomStatus) => void;
};

const CustomStatusSuggestion: React.FC<Props> = (props: Props) => {
    const {handleSuggestionClick, emoji, text, handleClear} = props;
    const [show, setShow] = useState(false);

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
                {messageHtmlToComponent(
                    `<span data-emoticon=${emoji} class="custom-status-suggestion-emoji"/>`,
                    false,
                    {emoji: true},
                )}
            </div>
            <span className='statusSuggestion__text'>
                {text}
            </span>
            {show && clearButton}
        </div>
    );
};

export default CustomStatusSuggestion;
