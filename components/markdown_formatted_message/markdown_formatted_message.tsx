import React from "react";
import { messageHtmlToComponent } from "utils/message_html_to_component";
import styled from "styled-components";
import EmojiMap from "utils/emoji_map";
import { formatText } from "utils/text_formatting";
import classNames from "classnames";

export enum MarkdownMessageType {
    Post = "post",
    Comment = "comment",
}
interface MarkdownFormattedMessageProps {
    message: string;
    emojiMap: EmojiMap;
    messageType: MarkdownMessageType.Post | MarkdownMessageType.Comment;
}

export const MarkdownFormattedMessage: React.ComponentType<MarkdownFormattedMessageProps> =
    ({ message, emojiMap, messageType }) => {
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

        const htmlFormattedText = formatText(message, undefined, emojiMap);

        console.log(htmlFormattedText, 'htmlFormattedText')
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
