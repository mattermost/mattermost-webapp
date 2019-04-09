// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Quill from 'quill';
import Delta from 'quill-delta';

import {initializeBlots} from './blots';
import * as Utils from './utils';

// TODO: there's got to be a better way to do this...
initializeBlots();

// QuillEditor is a mix between controlled and uncontrolled component.
// (see: https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)
// Controlled because CreatePost holds the message state (passed through to props.value).
// Uncontrolled, because the Quill object uses its own state (a shadow dom tree).
// QuillEditor transforms the Quill object's internal state into a markdown string, and sends
// that markdown string up to be worked with and stored into the message state (which is then
// passed to QuillEditor's props.value).
// When the parent components change the message state, QuillEditor will transform that
// into the Quill object's state.
// Source of Truth: therefore, the single source of truth is always CreatePosts's message state.
// If that changes, QuillEditor's contents will be changed.
export default class QuillEditor extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        spellCheck: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        onKeyPress: PropTypes.func.isRequired,
        onKeyDown: PropTypes.func.isRequired,
        style: PropTypes.object,
        value: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,

        // TODO: will implement
        onCompositionStart: PropTypes.func.isRequired,
        onCompositionUpdate: PropTypes.func.isRequired,
        onCompositionEnd: PropTypes.func.isRequired,

        // TODO: need to implement conditional rendering.
        config: PropTypes.object.isRequired,
        emojiMap: PropTypes.object.isRequired,

        // TODO: implement height-related functionality
        onHeightChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.quillEl = React.createRef();
        this.state = {valueInMarkdown: this.props.value};
    }

    componentDidMount = () => {
        // initialize quill
        this.editor = new Quill(this.quillEl.current,
            {
                modules: {toolbar: false},
                theme: null,
                placeholder: this.props.placeholder,
            });
        this.editor.on('text-change', this.handleChange);
    }

    componentWillUnmount = () => {
        // prevent memory leaks (wish it was this easy in real life)
        this.editor.off('text-change');
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        // The Quill object never needs to be re-rendered in response to props or state change,
        // at least after its been mounted (in this way it's an uncontrolled component)
        // But it does need to respond to props.value changes from parents -- the parent is
        // the single source of truth (in this way it's a controlled component)

        if (nextState.valueInMarkdown !== this.state.valueInMarkdown) {
            // we're just updating component state
            return false;
        }

        if (nextProps.value !== this.state.valueInMarkdown) {
            // we're receiving a new value from our parents.
            this.setState({valueInMarkdown: nextProps.value || ''});

            // TODO: convert the parent's source of truth to Quill's format
            this.editor.setContents([{insert: nextProps.value}]);
        }
        return false;
    }

    // todo: need to implement. Check AutosizeTextEditor
    // get selectionStart() {
    //     return this.forwardedRef.current.getEditorSelection();
    // }
    //
    // set selectionStart(selectionStart) {
    //     this.refs.textarea.selectionStart = selectionStart;
    // }
    //
    // get selectionEnd() {
    //     return this.refs.textarea.selectionEnd;
    // }
    //
    // set selectionEnd(selectionEnd) {
    //     this.refs.textarea.selectionEnd = selectionEnd;
    // }

    focus = () => {
        this.editor.focus();
    }

    blur = () => {
        this.editor.blur();
    }

    handleChange = (delta, oldContents, source) => {
        const contents = this.editor.getContents().ops;
        const newValue = Utils.prepareMarkdown(contents);
        if (newValue === this.state.valueInMarkdown) {

            // TODO: remove. for testing only.
            console.log("was same: handleChange, newValue: " + newValue + "; valueInMarkdown: " + this.state.valueInMarkdown);
            return;
        }

        // TODO: remove. for testing only.
        console.log("handleChange, newValue: " + newValue + "; valueInMarkdown: " + this.state.valueInMarkdown);

        // SuggestionBox.handleChange needs to know the caret and pretext
        const [leaf, localCaret] = this.editor.getLeaf(this.editor.getSelection(true).index);
        const leafText = leaf.text || '';

        // Create emojis as they are typed.
        // TODO: render conditionally based on config settings.
        if (localCaret >= 4 &&
            leafText.length >= 4 &&
            delta.ops[delta.ops.length - 1].hasOwnProperty('insert') &&
            delta.ops[delta.ops.length - 1].insert === ':') {
            const matched = Utils.detectEmojiOnColon(leafText, localCaret, this.props.emojiMap);
            if (matched) {
                this.insertEmojiReplacingLength(matched.name, matched.text.length);
            }
        }

        if (localCaret > 2 &&
            leafText.length > 2 &&
            delta.ops[delta.ops.length - 1].hasOwnProperty('insert') &&
            delta.ops[delta.ops.length - 1].insert === ' ') {
            const matched = Utils.detectLiteralEmojiOnSpace(leafText, localCaret, this.props.emojiMap);
            if (matched) {
                this.insertEmojiReplacingLength(matched.name, matched.text.length);
            }
        }

        // we now have this value, so no need to rerender when props.value is changed to this.
        this.setState({valueInMarkdown: newValue});

        // handled by SuggestionBox.handleChange
        this.props.onChange(newValue, leafText, localCaret);
    };

    // TODO: in the middle of implementing this.
    addMentionAtCaret = (mention) => {
        const globalCaret = this.editor.getSelection().index;

        this.editor.insertText(globalCaret, mention);

        const newValue = Utils.prepareMarkdown(this.editor.getContents().ops);
        this.setState({valueInMarkdown: newValue});
        return newValue;
    }

    // called from SuggestionBox or CreatePost (through Textbox)
    addEmojiAtCaret = (term, matchedPretext) => {
        // getSelection will focus the editor
        this.editor.focus();
        let globalCaret = this.editor.getSelection().index;

        // get the leaf we're currently in -- could be a text leaf if we were just typing,
        // or a blank leaf if we used the emoji picker right after a previous emoji
        let [leaf, localCaret] = this.editor.getLeaf(globalCaret);

        // we're or-ing an empty string here because if this is line with no text,
        // text will be undefined
        let text = leaf.text || '';

        // remove the \t or \n that quill adds, if any
        const recentChar = text.charAt(localCaret - 1);
        if (recentChar === '\t' || recentChar === '\n') {
            text = text.slice(0, localCaret - 1) + text.slice(localCaret);
            const removeChar = new Delta().retain(globalCaret - 1).delete(1);
            this.editor.updateContents(removeChar);
            globalCaret -= 1;
            localCaret -= 1;
        }

        const pretext = text.substring(0, localCaret);

        let keepPretext = false;
        if (!pretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
            // the pretext has changed since we got a term to complete so see if the term still fits the pretext
            const termWithoutMatched = term.substring(matchedPretext.length);
            const overlap = Utils.findOverlap(pretext, termWithoutMatched);

            keepPretext = overlap.length === 0;
        }

        const emojiName = term.slice(1, -1);
        this.insertEmojiReplacingLength(emojiName, matchedPretext.length);

        const newValue = Utils.prepareMarkdown(this.editor.getContents().ops);
        this.setState({valueInMarkdown: newValue});
        return newValue;
    }

    insertEmojiReplacingLength = (name, length) => {
        let globalCaret = this.editor.getSelection().index;

        // get the emoji Url
        // Todo: should separate this? It depends on props that this component shouldn't care about
        //   but not sure of the best way to get the props into a non-react component
        const imageUrl = Utils.getEmojiUrl(name, this.props.emojiMap);

        const delta = new Delta().retain(globalCaret - length).delete(length);
        this.editor.updateContents(delta);
        globalCaret -= length;

        this.editor.insertEmbed(globalCaret, 'emoji', {name, imageUrl});
        this.editor.setSelection(globalCaret + 1);
    };

    render = () => {
        // TODO: for testing only. remove.
        console.log('rendering QuillEditor'); //eslint-disable-line

        // TODO: implement: disabled, onCompositionStart/End/Update
        const {
            onKeyPress,
            onKeyDown,

            // TODO: The provided `id` is sometimes hard-coded and used to interface with the
            // component, e.g. `post_textbox`, so it can't be changed. This would ideally be
            // abstracted to avoid passing in an `id` prop at all, but we intentionally maintain
            // the old behaviour to address ABC-213.
            // TODO: might not need `id` since we're passing down a ref... Investigate.
            id,
        } = this.props;

        return (
            <div
                ref={this.quillEl}
                id={id}
                className={this.props.className}
                onKeyPress={onKeyPress}
                onKeyDown={onKeyDown}
            />
        );
    }
}
