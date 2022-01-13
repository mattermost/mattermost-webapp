import classNames from "classnames";
import React from "react";
import styled from "styled-components";
import { ApplyHotkeyMarkdownOptions } from "utils/utils";

const FormattingBarContainer = styled.div`
    display: flex;
    max-height: 0;
    transform-origin: top;
    overflow: hidden;
    transition: max-height 0.25s ease;

    &.isOpen {
        max-height: 100px;
    }

    div {
        border: 1px solid grey;
        padding: 3px;
        background: #e8e8e8;
        margin: 0 5px;
        cursor: pointer;
    }

    div:hover {
        border: 1px solid darkgrey;
        padding: 3px;
        background: #888;
        color: #fff;
        margin: 0 5px;
        cursor: pointer;
    }
`;

interface FormattingBarProps {
    isOpen: boolean;
    applyMarkdown: (e: React.KeyboardEvent<Element>, options?: ApplyHotkeyMarkdownOptions) => void;
    textBox: HTMLInputElement;
    value:string
}

export const FormattingBar: React.ComponentType<FormattingBarProps> = ({
    isOpen,
    applyMarkdown,
    textBox,
    value
}) => {
    return (
        <FormattingBarContainer
            className={classNames({
                isOpen,
            })}
        >
            <div
                onClick={(e) => {
                    const selectionStart = textBox.selectionStart
                    const selectionEnd = textBox.selectionEnd

                    applyMarkdown({} as any, {markdownMode: 'bold', selectionStart, selectionEnd, value})
                }}
            >
                bold
            </div>
            <div onClick={(e) => {
                    const selectionStart = textBox.selectionStart
                    const selectionEnd = textBox.selectionEnd

                    applyMarkdown({} as any, {markdownMode: 'italic', selectionStart, selectionEnd, value})
                }}>italic</div>
            {/* <div>strike</div> */}
            {/* <div>heading</div> */}
            <div
            onClick={(e) => {
                const selectionStart = textBox.selectionStart
                const selectionEnd = textBox.selectionEnd

                applyMarkdown({} as any, {markdownMode: 'link', selectionStart, selectionEnd, value})
            }}>link</div>
            {/* <div>inline code</div>
            <div>preformatted</div>
            <div>quote</div> */}
        </FormattingBarContainer>
    );
};
