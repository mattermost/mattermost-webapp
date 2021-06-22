// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {UserCustomStatus} from 'mattermost-redux/types/users';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import Constants, {durationValues} from 'utils/constants';

import CustomStatusText from './custom_status_text';

import './custom_status.scss';

type Props = {
    handleSuggestionClick: (status: UserCustomStatus) => void;
    handleClear?: (status: UserCustomStatus) => void;
    status: UserCustomStatus;
};

const CustomStatusSuggestion: React.FC<Props> = (props: Props) => {
    const {handleSuggestionClick, handleClear, status} = props;
    const {emoji, text, duration} = status;
    const [show, setShow] = useState(false);

    const showClearButton = () => setShow(true);

    const hideClearButton = () => setShow(false);

    const handleRecentCustomStatusClear = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (handleClear) {
            handleClear(status);
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
            onClick={() => handleSuggestionClick(status)}
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
                className={classNames('statusSuggestion__text', {
                    with_duration: duration,
                })}
            />
            {duration && (
                <span className='statusSuggestion__duration'>
                    <FormattedMessage
                        id={durationValues[duration].id}
                        defaultMessage={durationValues[duration].defaultMessage}
                    />
                </span>
            )}
            {show && clearButton}
        </div>
    );
};

export default CustomStatusSuggestion;
