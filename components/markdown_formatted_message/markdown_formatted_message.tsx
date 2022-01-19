// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import styled from 'styled-components';

import classNames from 'classnames';

import {messageHtmlToComponent} from 'utils/message_html_to_component';
import EmojiMap from 'utils/emoji_map';
import {formatText} from 'utils/text_formatting';

const MessageComponentContainer = styled.div`
    padding: 13px 125px 12px 16px;
    border-radius: 4px;
    line-height: 20px;

    &.comment {
        min-height: 100px;
    }

    &.post {
        min-height: 46px;
    }

    & p {
        margin: 0;
    }
`;

export enum MarkdownMessageType {
    Post = 'post',
    Comment = 'comment',
}

interface MarkdownFormattedMessageProps {
    message: string;
    emojiMap: EmojiMap;
    messageType: MarkdownMessageType.Post | MarkdownMessageType.Comment;
}

export const MarkdownFormattedMessage = (props: MarkdownFormattedMessageProps): JSX.Element => {
    const {message, emojiMap, messageType} = props;
    const htmlFormattedText = formatText(message, undefined, emojiMap);

    return (
        <MessageComponentContainer
            className={classNames({
                post: messageType === MarkdownMessageType.Post,
                comment: messageType === MarkdownMessageType.Comment,
            })}
        >
            {messageHtmlToComponent(htmlFormattedText, false)}
        </MessageComponentContainer>
    );
};
