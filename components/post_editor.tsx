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
        const imageSpan = `<span alt="${text}" class="emoticon" title="${text}" style="height: inherit; min-height: inherit">${image}</span>`;
        const textSpan = `<span style="display:none">${text}</span>`;
        return `<span data-emoticon="${name}" contenteditable="false">${imageSpan}${textSpan}</span><span></span>`;
    };
}

function getSelectionNodes(nodes: NodeListOf<ChildNode>, selectionStart: number, selectionEnd: number) {
    let nodeOffset = 0;
    const start = {node: null as ChildNode | null, offset: 0};
    const end = {node: null as ChildNode | null, offset: 0};

    for (const node of nodes) {
        const nodeEndOffset = nodeOffset + (node.textContent ? node.textContent.length : 0);
        const nodeCanBeSelected = (node as Element).tagName !== 'SPAN' || (node as Element).getAttribute('contenteditable') !== 'false';

        if (nodeCanBeSelected) {
            if (!start.node && nodeEndOffset >= selectionStart) {
                start.node = node;
                start.offset = selectionStart - nodeOffset;
            }
            if (!end.node && nodeEndOffset >= selectionEnd) {
                end.node = node;
                end.offset = selectionEnd - nodeOffset;
            }
        }

        if (start.node && end.node) {
            break;
        }

        nodeOffset = nodeEndOffset;
    }

    return {start, end};
}

function replaceInParentElementHtml(replacement: string, node: Node) {
    if (!node.parentNode || !node.textContent) {
        return '';
    }

    let innerHTMLStartOffset = 0;
    for (const childNode of node.parentNode.childNodes) {
        if (childNode === node) {
            break;
        }

        const outerHTML = (childNode as Element).outerHTML;
        if (outerHTML) {
            innerHTMLStartOffset += outerHTML.length;
        } else {
            innerHTMLStartOffset += childNode.textContent ? childNode.textContent.length : 0;
        }
    }

    const innerHTMLEndOffset = innerHTMLStartOffset + node.textContent.length;
    const html = (node.parentNode as Element).innerHTML;
    return `${html.slice(0, innerHTMLStartOffset)}${replacement}${html.slice(innerHTMLEndOffset)}`;
}

function addNewTextNode(element: Element) {
    const newNode = document.createTextNode('');
    element.appendChild(newNode);
    return newNode;
}

export default class PostEditor extends React.PureComponent<Props, {showingPlaceholder: boolean}> {
    state = {showingPlaceholder: true};
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

    private setSelectionInEditor = () => {
        if (!this.selection) {
            return;
        }

        const range = document.createRange();
        const sel = window.getSelection();
        const childNodes = (this.refs.editor as Element).childNodes;
        const {start, end} = getSelectionNodes(childNodes, this.selection.start, this.selection.end);
        if (!sel || !start.node || !end.node) {
            return;
        }

        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private getEmoticons = (value: string) => {
        const renderEmoji = renderEditorEmoji(this.props.emojiMap);
        const tokens = new Map();
        const withEmoticons = handleEmoticons(value, tokens, renderEmoji);

        return {withEmoticons, tokens};
    }

    private updateEditorHtml = (value: string) => {
        if (!this.refs.editor) {
            return;
        }

        const {withEmoticons, tokens} = this.getEmoticons(value);
        (this.refs.editor as Element).innerHTML = replaceTokens(withEmoticons, tokens);
    }

    private rearrangeNodes = (range: Range, currentNode: Node) => {
        const nodeText = currentNode.textContent || '';
        if (range.endOffset !== 1 ||
            nodeText.length === 0 ||
            nodeText[0] === ' ' ||
            !currentNode.previousSibling ||
             (currentNode.previousSibling as Element).tagName !== 'SPAN') {
            return currentNode;
        }

        const emojiNode = currentNode.previousSibling.previousSibling;
        if (!emojiNode) {
            return currentNode;
        }

        const editorElement = this.refs.editor as Element;
        const newTextContent = `${emojiNode.textContent}${nodeText}`;

        const addToPrevious = emojiNode.previousSibling && emojiNode.previousSibling.nodeType === emojiNode.previousSibling.TEXT_NODE;
        editorElement.removeChild(currentNode.previousSibling);
        editorElement.removeChild(currentNode);
        const newNode = addToPrevious ? emojiNode.previousSibling as Node : document.createTextNode('');
        newNode.textContent = `${newNode.textContent || ''}${newTextContent}`;
        if (addToPrevious) {
            editorElement.removeChild(emojiNode);
        } else {
            editorElement.replaceChild(newNode, emojiNode);
        }

        return newNode;
    }

    private updateEditorHtmlOnInput = () => {
        const selection = window.getSelection();
        if (!selection) {
            return;
        }
        const range = selection.getRangeAt(0);
        const node = range.endContainer;
        if (!node.textContent || !node.parentNode) {
            return;
        }

        this.updateCurrentSelection();
        const editorElement = this.refs.editor as Element;
        if (node === this.refs.editor) {
            editorElement.innerHTML = `${editorElement.innerHTML}<span></span>`;
            this.setSelectionInEditor();
            return;
        }

        const nodeToUpdate = this.rearrangeNodes(range, node);
        const {withEmoticons, tokens} = this.getEmoticons(nodeToUpdate.textContent || '');
        if (tokens.size === 0) {
            this.setSelectionInEditor();
            return;
        }

        const replaced = replaceTokens(withEmoticons, tokens);
        editorElement.innerHTML = replaceInParentElementHtml(replaced, nodeToUpdate);
        this.setSelectionInEditor();
    }

    get value() {
        return (this.refs.editor as Element).textContent || '';
    }

    set value(value) {
        this.selection = {start: value.length, end: value.length};
        this.updateEditorHtml(value);
        this.setSelectionInEditor();
        this.setState({showingPlaceholder: value === ''});
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
            this.setSelectionInEditor();
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
            this.setSelectionInEditor();
        }
    }

    getBoundingClientRect = () => (this.refs.editor as Element).getBoundingClientRect();

    setSelectionRange(selectionStart: number, selectionEnd: number) {
        this.selection = {start: selectionStart, end: selectionEnd};
        if (document.activeElement === this.refs.editor) {
            this.setSelectionInEditor();
        }
    }

    focus() {
        (this.refs.editor as HTMLDivElement).focus();
        if (this.selection) {
            this.setSelectionInEditor();
        }
    }

    blur() {
        (this.refs.editor as HTMLDivElement).blur();
    }

    componentDidMount() {
        this.updateEditorHtml(this.props.value || this.props.defaultValue || '');
    }

    private ensureCorrectNode = () => {
        const selection = window.getSelection() as Selection;
        const range = selection.getRangeAt(0);
        const parentElement = (range.endContainer as Element).parentElement as Element;
        if (parentElement.tagName === 'DIV') {
            return;
        }
        let nodeToSelect = parentElement.nextSibling;
        if (!nodeToSelect) {
            nodeToSelect = addNewTextNode(parentElement.parentElement as Element);
        }

        nodeToSelect.textContent = `${range.endContainer.textContent || ''}${nodeToSelect.textContent}`;
        range.endContainer.textContent = '';
        range.setStart(nodeToSelect, 1);
        range.setEnd(nodeToSelect, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    onInput = () => {
        this.ensureCorrectNode();
        this.updateEditorHtmlOnInput();
        this.currentSelectionInvalid = true;
        this.setState({showingPlaceholder: ((this.refs.editor as Element).textContent || '') === ''});
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
        const placeholderAriaLabel = placeholder ? placeholder.toLowerCase() : '';

        return (
            <>
                {placeholder && this.state.showingPlaceholder && (
                    <div
                        {...props}
                        style={style.placeholder}
                    >
                        {placeholder}
                    </div>)}
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
