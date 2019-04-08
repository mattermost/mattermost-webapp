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

// TODO: need to respect config (whether or not to show emojis). See post_emoji component.
export default class QuillEditor extends React.Component {
    static propTypes = {

        // TODO: for optional rendering. Will need later.
        config: PropTypes.object.isRequired,
        emojiMap: PropTypes.object.isRequired,
        value: PropTypes.string,
        placeholder: PropTypes.string,
        id: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onKeyPress: PropTypes.func,
        onKeyDown: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired,

        // TODO: are the below needed?
        onHeightChange: PropTypes.func,
        defaultValue: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.quillEl = React.createRef();

        // TODO: move this into Redux eventually. Then wire the higher level components to use that,
        //  instead of polling this component via ref.
        this.state = {
            valueInMarkdown: '',
        };
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

    // todo: need to implement? Check AutosizeTextEditor
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

    // TODO: refactor upstream components to use something like a delta format?
    handleChange = (delta, oldContents, source) => {
        const contents = this.editor.getContents().ops;
        const newValue = Utils.prepareMarkdown(contents);

        if (newValue === this.state.valueInMarkdown) {
            return;
        }

        // TODO: extend this upwards.
        this.setState({valueInMarkdown: newValue});

        // SuggestionBox.handleChange needs to know the caret and pretext
        const [leaf, localCaret] = this.editor.getLeaf(this.editor.getSelection().index);
        const leafText = leaf.text || '';

        // handled by SuggestionBox.handleChange
        this.props.onChange(newValue, leafText, localCaret);
    };

    // TODO: in the middle of implementing this.
    addMentionAtCaret = (mention) => {
        const globalCaret = this.editor.getSelection().index;

        this.editor.insertText(globalCaret, mention);

        return Utils.prepareMarkdown(this.editor.getContents().ops);
    }

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

        // get the emoji Url
        // Todo: should separate this? It depends on props that this component shouldn't care about
        //   but not sure of the best way to get the props into a non-react component
        const emojiName = term.slice(1, -1);
        const imageUrl = Utils.getEmojiUrl(emojiName, this.props.emojiMap);

        if (!keepPretext) {
            const delta = new Delta().
                retain(globalCaret - matchedPretext.length).
                delete(matchedPretext.length);
            this.editor.updateContents(delta);
            globalCaret -= matchedPretext.length;
        }

        this.editor.insertEmbed(globalCaret, 'emoji', {name: emojiName, imageUrl});
        this.editor.setSelection(globalCaret + 1);

        return Utils.prepareMarkdown(this.editor.getContents().ops);
    }

    render = () => {
        // TODO: we're rerendering often... Eventually figure out why.
        console.log('rendering QuillEditor'); //eslint-disable-line

        // TODO: impilement: disabled, onCompositionStart/End/Update
        const {
            onKeyPress,
            onKeyDown,

            // TODO: The provided `id` is sometimes hard-coded and used to interface with the
            // component, e.g. `post_textbox`, so it can't be changed. This would ideally be
            // abstracted to avoid passing in an `id` prop at all, but we intentionally maintain
            // the old behaviour to address ABC-213.
            // TODO: might not need `id` since we're passing down a ref... Investigate.
            id,

            // TODO: need to refactor, do we need value?
            value,
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
