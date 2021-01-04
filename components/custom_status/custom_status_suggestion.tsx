// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import messageHtmlToComponent from 'utils/message_html_to_component';
import './custom_status.scss';

type CustomStatus = {
    emoji: string;
    text: string;
}

type Props = {
    handleSuggestion: (status: CustomStatus) => void;
    emoji: string;
    text: string;
};

const CustomStatusSuggestion: React.FC<Props> = (props: Props) => {
    const {handleSuggestion, emoji, text} = props;
    return (
        <div
            className='statusSuggestion__row cursor--pointer a11y--active'
            onClick={
                () => handleSuggestion(
                    {
                        emoji,
                        text,
                    })
            }
        >
            <div className='statusSuggestion__icon'>
                {messageHtmlToComponent(
                    `<span data-emoticon=${emoji} class="custom-status-emoji"/>`,
                    false,
                    {emoji: true},
                )}
            </div>
            <span className='statusSuggestion__text'>
                {text}
            </span>
        </div>
    );
};

export default CustomStatusSuggestion;
