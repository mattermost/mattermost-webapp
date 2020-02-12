// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FormEvent} from 'react';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {handleEmoticons} from 'utils/emoticons';
import {replaceTokens} from 'utils/text_formatting';
import EmojiMap from 'utils/emoji_map';

type Props = {
    value?: string;
    defaultValue?: string;
    onInput?: (e: FormEvent<HTMLDivElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    emojiMap: EmojiMap;
}

function renderEditorEmoji(emojiMap: EmojiMap) {
    return (name: string, text: string) => {
        const emoji = emojiMap.get(name);
        if (!emoji) {
            return text;
        }
        const imageUrl = getEmojiImageUrl(emoji);
        if (!emoji) {
            return text;
        }

        const image = `<img style="height: 18px" src="${imageUrl}" />`;
        const imageSpan = `<span alt="${text}" class="emoticon" title="${text} style="height: inherit; min-height: inherit">${image}</span>`;
        const textSpan = `<span style="display:none">${text}</span>`
        return `<span data-emoticon="${name}" contenteditable="false">${imageSpan}${textSpan}</span>`;
    };
}

function getSelectionNodes(nodes: NodeListOf<ChildNode>, selectionStart: number, selectionEnd: number) {
    let nodeOffset = 0;
    const start = {node: null as ChildNode | null, offset: 0};
    const end = {node: null as ChildNode | null, offset: 0};
    for (const node of nodes) {
        const nodeEndOffset = nodeOffset + (node.textContent ? node.textContent.length : 0);
        if (!start.node && nodeEndOffset >= selectionStart) {
            start.node = node;
            start.offset = selectionStart - nodeOffset;
        }
        if (!end.node && nodeEndOffset >= selectionEnd) {
            end.node = node;
            end.offset = selectionEnd - nodeOffset;
        }

        if (start.node && end.node) {
            break;
        }

        nodeOffset = nodeEndOffset;
    }

    return {start, end};
}

export default class Editor extends React.PureComponent<Props> {
    private selection: null | {start: number; end: number} = null;
    private currentSelectionInvalid = false;

    private updateCurrentSelection = () => {
        const selection = window.getSelection();
        if (!selection || !this.refs.editor) {
            return;
        }

        const range = selection.getRangeAt(0);
        const clonedRange = range.cloneRange();
        clonedRange.selectNodeContents(this.refs.editor as Element);
        clonedRange.setEnd(range.endContainer, range.endOffset);
        const end = clonedRange.toString().length;

        clonedRange.setStart(range.startContainer, range.startOffset);
        const start = end - clonedRange.toString().length;
        this.selection = {start, end};
    }

    private updateSelection = () => {
        if (!this.selection) {
            return;
        }

        const range = document.createRange();
        const sel = window.getSelection();
        const {start, end} = getSelectionNodes((this.refs.editor as Element).childNodes, this.selection.start, this.selection.end);
        if (!sel || !start.node || !end.node) {
            return;
        }

        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private updateEditorHtml = (value: string) => {
        if (!this.refs.editor) {
            return;
        }

        const renderEmoji = renderEditorEmoji(this.props.emojiMap);
        const tokens = new Map();
        const withEmojis = handleEmoticons(value, tokens, renderEmoji);
        (this.refs.editor as HTMLDivElement).innerHTML = replaceTokens(withEmojis, tokens);
    }

    get value() {
        return (this.refs.editor as Element).textContent || '';
    }

    set value(value) {
        this.selection = {start: value.length, end: value.length};
        this.updateEditorHtml(value);
    }

    get selectionStart() {
        if (this.currentSelectionInvalid) {
            this.updateCurrentSelection();
        }

        return this.selection ? this.selection.start : 0;
    }

    set selectionStart(selectionStart) {
        this.selection = this.selection ? {...this.selection, start: selectionStart} : {start: selectionStart, end: selectionStart};
        if (document.activeElement === this.refs.editor) {
            this.updateSelection();
        }
    }

    get selectionEnd() {
        if (this.currentSelectionInvalid) {
            this.updateCurrentSelection();
        }

        return this.selection ? this.selection.end : 0;
    }

    set selectionEnd(selectionEnd) {
        this.selection = this.selection ? {...this.selection, end: selectionEnd} : {start: selectionEnd, end: selectionEnd};
        if (document.activeElement === this.refs.editor) {
            this.updateSelection();
        }
    }

    getBoundingClientRect = () => (this.refs.editor as Element).getBoundingClientRect();

    setSelectionRange(selectionStart: number, selectionEnd: number) {
        this.selection = {start: selectionStart, end: selectionEnd};
        if (document.activeElement === this.refs.editor) {
            this.updateSelection();
        }
    }

    focus() {
        (this.refs.editor as HTMLDivElement).focus();
        if (this.selection) {
            this.updateSelection();
        }
    }

    blur() {
        (this.refs.editor as HTMLDivElement).blur();
    }

    componentDidMount() {
        this.updateEditorHtml(this.props.value || this.props.defaultValue || '');
    }

    onInput = () => {
        this.currentSelectionInvalid = true;
        if (this.props.onInput) {
            const inputEvent = {
                target: this,
            } as any;

            this.props.onInput(inputEvent);
        }
    }

    handleKeyDown = (e: React.KeyboardEvent) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.BACKSPACE) ||
            Utils.isKeyPressed(e, Constants.KeyCodes.LEFT) ||
            Utils.isKeyPressed(e, Constants.KeyCodes.RIGHT)) {
            this.currentSelectionInvalid = true;
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    render() {
        const props = {...this.props};

        Reflect.deleteProperty(props, 'onHeightChange');
        Reflect.deleteProperty(props, 'providers');
        Reflect.deleteProperty(props, 'channelId');
        Reflect.deleteProperty(props, 'emojiMap');
        Reflect.deleteProperty(props, 'value');
        Reflect.deleteProperty(props, 'defaultValue');
        Reflect.deleteProperty(props, 'onInput');
        Reflect.deleteProperty(props, 'onKeydown');

        const {placeholder} = props;

        let textareaPlaceholder = null;
        const placeholderAriaLabel = placeholder ? placeholder.toLowerCase() : '';
        if (this.refs.editor && (this.refs.editor as Element).textContent === '') {
            textareaPlaceholder = (
                <div
                    {...props}
                    style={style.placeholder}
                >
                    {placeholder}
                </div>
            );
        }

        return (
            <>
                {textareaPlaceholder}
                <div
                    {...props}
                    ref='editor'
                    contentEditable={true}
                    onInput={this.onInput}
                    onKeyDown={this.handleKeyDown}
                    role='textbox'
                    aria-label={placeholderAriaLabel}
                />
            </>);
    }
}

const style: { [Key: string]: React.CSSProperties} = {
    placeholder: {overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.5, pointerEvents: 'none', position: 'absolute', whiteSpace: 'nowrap', background: 'none'},
};
