// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import QuillEditor from 'components/quill_editor';
import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;

export default class SuggestionBoxQL extends React.Component {
    static propTypes = {

        /**
         * The list component to render, usually SuggestionList
         */
        listComponent: PropTypes.func.isRequired,

        /**
         * The date component to render
         */
        dateComponent: PropTypes.func,

        /**
         * The value of in the input
         */
        value: PropTypes.string.isRequired,

        /**
         * Array of suggestion providers
         */
        providers: PropTypes.arrayOf(PropTypes.object),

        /**
         * Where the list will be displayed relative to the input box, defaults to 'top'
         */
        listStyle: PropTypes.string,

        /**
         * CSS class for the div parent of the input box
         */
        containerClass: PropTypes.string,

        /**
         * Set to true to draw dividers between types of list items, defaults to false
         */
        renderDividers: PropTypes.bool,

        /**
         * Set to true to render a message when there were no results found, defaults to false
         */
        renderNoResults: PropTypes.bool,

        /**
         * Set to allow TAB to select an item in the list, defaults to true
         */
        completeOnTab: PropTypes.bool,

        /**
         * Function called when input box gains focus
         */
        onFocus: PropTypes.func,

        /**
         * Function called when input box loses focus
         */
        onBlur: PropTypes.func,

        /**
         * Function called when input box value changes
         */
        onChange: PropTypes.func,

        /**
         * Function called when a key is pressed and the input box is in focus
         */
        onKeyDown: PropTypes.func,
        onKeyPress: PropTypes.func,
        onComposition: PropTypes.func,

        /**
         * Function called when an item is selected
         */
        onItemSelected: PropTypes.func,

        /**
         * Flags if the suggestion_box is for the RHS (Reply).
         */
        isRHS: PropTypes.bool,

        /**
         * The number of characters required to show the suggestion list, defaults to 1
         */
        requiredCharacters: PropTypes.number,

        /**
         * If true, the suggestion box is opened on focus, default to false
         */
        openOnFocus: PropTypes.bool,

        /**
         * If true, the suggestion box is disabled
         */
        disabled: PropTypes.bool,

        /**
         * If true, it displays allow to display a default list when empty
         */
        openWhenEmpty: PropTypes.bool,

        /**
         * If true, replace all input in the suggestion box with the selected option after a select, defaults to false
         */
        replaceAllInputOnSelect: PropTypes.bool,

        /**
         * An optional, opaque identifier that distinguishes the context in which the suggestion
         * box is rendered. This allows the reused component to otherwise respond to changes.
         */
        contextId: PropTypes.string,

        /**
         * If true, listen for clicks on a mention and populate the input with said mention, defaults to false
         */
        listenForMentionKeyClick: PropTypes.bool,

        /**
         * maxLength is optional. If it exists, the input will not allow any more characters typed past the maxLength.
         */
        maxLength: PropTypes.number,

        /**
         * The reference created in Textbox and passed through to be bound to the QuillEditor.
         */
        editorRef: PropTypes.oneOfType([
            PropTypes.shape({current: PropTypes.func}),
            PropTypes.shape({current: PropTypes.object}),
        ]),
    };

    static defaultProps = {
        listStyle: 'top',
        containerClass: '',
        renderDividers: false,
        renderNoResults: false,
        completeOnTab: true,
        isRHS: false,
        requiredCharacters: 1,
        openOnFocus: false,
        openWhenEmpty: false,
        replaceAllInputOnSelect: false,
        listenForMentionKeyClick: false,
    }

    constructor(props) {
        super(props);

        // Keep track of whether we're composing a CJK character so we can make suggestions for partial characters
        this.composing = false;

        this.pretext = '';

        // Used for debouncing pretext changes
        this.timeoutId = '';

        // pretext: the text before the cursor
        // matchedPretext: a list of the text before the cursor that will be replaced if the corresponding autocomplete term is selected
        // terms: a list of strings which the previously typed text may be replaced by
        // items: a list of objects backing the terms which may be used in rendering
        // components: a list of react components that can be used to render their corresponding item
        // selection: the term currently selected by the keyboard
        this.state = {
            focused: false,
            cleared: true,
            matchedPretext: [],
            items: [],
            terms: [],
            components: [],
            selection: '',
            allowDividers: true,
            presentationType: 'text',
        };
    }

    componentDidMount() {
        if (this.props.listenForMentionKeyClick) {
            EventEmitter.addListener('mention_key_click', this.handleMentionKeyClick);
        }
    }

    componentWillUnmount() {
        EventEmitter.removeListener('mention_key_click', this.handleMentionKeyClick);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.contextId !== this.props.contextId) {
            // TODO: implement
            // const editor = this.getEditor();
            // const selectionEnd = editor.getSelection()[length];
            // const pretext = editor.getText().substring(0, selectionEnd).toLowerCase();
            //
            // this.handlePretextChanged(pretext);
        }
    }

    handleMentionKeyClick = (mentionKey, isRHS) => {
        if (this.props.isRHS !== isRHS) {
            return;
        }

        let insertText = '@' + mentionKey;

        // if the current text does not end with a whitespace, then insert a space
        if (this.props.value && (/[^\s]$/).test(this.props.value)) {
            insertText = ' ' + insertText;
        }

        this.addMentionAtCaret(insertText);
    }

    getEditor = () => {
        return this.props.editorRef.current.getWrappedInstance();
    }

    // TODO: implement
    // recalculateSize = () => {
    //     // Pretty hacky way to force an AutosizeTextarea to recalculate its height if that's what
    //     // we're rendering as the input
    //     const input = this.refs.input.getInput();
    //
    //     if (input.recalculateSize) {
    //         input.recalculateSize();
    //     }
    // }

    handleEmitClearSuggestions = (delay = 0) => {
        setTimeout(() => {
            this.clear();
        }, delay);
    }

    handleFocusOut = (e) => {
        // Focus is switching TO e.relatedTarget, so only treat this as a blur event if we're not switching
        // between children (like from the textbox to the suggestion list)
        if (this.container.contains(e.relatedTarget)) {
            return;
        }

        if (UserAgent.isIos() && !e.relatedTarget) {
            // On Safari and iOS classic app, the autocomplete stays open
            // when you tap outside of the post textbox or search box.
            return;
        }

        this.handleEmitClearSuggestions();

        this.setState({focused: false});

        if (this.props.onBlur) {
            this.props.onBlur();
        }
    };

    handleFocusIn = (e) => {
        // Focus is switching FROM e.relatedTarget, so only treat this as a focus event if we're not switching
        // between children (like from the textbox to the suggestion list)
        if (this.container.contains(e.relatedTarget)) {
            return;
        }

        this.setState({focused: true});

        if (this.props.openOnFocus || this.props.openWhenEmpty) {
            setTimeout(() => {
                const editor = this.getEditor();

                // TODO: not yet updated to the new way editor works
                if (editor) {
                    const cleanedValue = editor.getText().slice(0, -1);
                    const selectionEnd = editor.getSelection().index;
                    const pretext = cleanedValue.substring(0, selectionEnd);
                    if (this.props.openWhenEmpty || pretext.length >= this.props.requiredCharacters) {
                        this.handlePretextChanged(pretext);
                    }
                }
            });
        }

        if (this.props.onFocus) {
            this.props.onFocus();
        }
    };

    handleChange = (value, localText, localCaret) => {
        const pretext = localText.slice(0, localCaret).toLowerCase();

        if (!this.composing && this.pretext !== pretext) {
            this.handlePretextChanged(pretext);
        }

        if (this.props.onChange) {
            // handled by Textbox.handleChange -> parent.handleChange
            this.props.onChange({target: {value}});
        }
    }

    // is handled by createPost.emitTypingEvent
    handleCompositionStart = () => {
        this.composing = true;
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    // is handled by createPost.emitTypingEvent
    handleCompositionUpdate = (e, localText) => {
        if (!e.data) {
            return;
        }

        // The caret appears before the CJK character currently being composed, so re-add it to the pretext
        const pretext = localText + e.data;

        this.handlePretextChanged(pretext);
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    // is handled by createPost.emitTypingEvent
    handleCompositionEnd = () => {
        this.composing = false;
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    addEmojiAtCaret = (term, matchedPretext, tabOrEnter) => {
        const newValue = this.getEditor().addEmojiAtCaret(term, matchedPretext, tabOrEnter);

        if (this.props.onChange) {
            // fake an input event to send back to parent components
            // don't call handleChange from editor or we'll get into an event loop
            this.props.onChange({target: {value: newValue}});
        }
    }

    addTextAtCaret = (mention, matchedPretext, tabOrEnter) => {
        const newValue = this.getEditor().addTextAtCaret(mention, matchedPretext, tabOrEnter);

        if (this.props.onChange) {
            // fake an input event to send back to parent components
            // don't call handleChange from editor or we'll get into an event loop
            this.props.onChange({target: {value: newValue}});
        }
    }

    replaceText = (term) => {
        const editor = this.getEditor();
        editor.replaceText(term);

        if (this.props.onChange) {
            // fake an input event to send back to parent components
            // don't call handleChange or we'll get into an event loop
            this.props.onChange({target: {value: term}});
        }
    }

    handleCompleteWord = (term, matchedPretext, tabOrEnter = false) => {
        if (this.props.replaceAllInputOnSelect) {
            this.replaceText(term);
        } else if ((/^:\w{2,}:$/).test(term)) {
            this.addEmojiAtCaret(term, matchedPretext, tabOrEnter);
        } else {
            this.addTextAtCaret(term, matchedPretext, tabOrEnter);
        }

        if (this.props.onItemSelected) {
            const items = this.state.items;
            const terms = this.state.terms;
            for (let i = 0; i < terms.length; i++) {
                if (terms[i] === term) {
                    this.props.onItemSelected(items[i]);
                    break;
                }
            }
        }

        this.clear();

        this.getEditor().focus();

        for (const provider of this.props.providers) {
            if (provider.handleCompleteWord) {
                provider.handleCompleteWord(term, matchedPretext);
            }
        }
    }

    selectNext = () => {
        this.setSelectionByDelta(1);
    }

    selectPrevious = () => {
        this.setSelectionByDelta(-1);
    }

    setSelectionByDelta = (delta) => {
        let selectionIndex = this.state.terms.indexOf(this.state.selection);

        if (selectionIndex === -1) {
            this.setState({
                selection: '',
            });
            return;
        }

        selectionIndex += delta;

        if (selectionIndex < 0) {
            selectionIndex = 0;
        } else if (selectionIndex > this.state.terms.length - 1) {
            selectionIndex = this.state.terms.length - 1;
        }

        this.setState({
            selection: this.state.terms[selectionIndex],
        });
    }

    clear = () => {
        this.setState({
            cleared: true,
            matchedPretext: [],
            terms: [],
            items: [],
            components: [],
        });
    }

    hasSuggestions = () => {
        return this.state.items.some((item) => !item.loading);
    }

    handleKeyDown = (e) => {
        if ((this.props.openWhenEmpty || this.props.value) && this.hasSuggestions()) {
            if (Utils.isKeyPressed(e, KeyCodes.UP)) {
                this.selectPrevious();
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
                this.selectNext();
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ENTER) || (this.props.completeOnTab && Utils.isKeyPressed(e, KeyCodes.TAB))) {
                let matchedPretext = '';
                for (let i = 0; i < this.state.terms.length; i++) {
                    if (this.state.terms[i] === this.state.selection) {
                        matchedPretext = this.state.matchedPretext[i];
                    }
                }

                // If these don't match, the user typed quickly and pressed enter before we could
                // update the pretext, so update the pretext before completing
                if (this.pretext.endsWith(matchedPretext)) {
                    this.handleCompleteWord(this.state.selection, matchedPretext, true);
                } else {
                    clearTimeout(this.timeoutId);
                    this.nonDebouncedPretextChanged(this.pretext, true);
                }

                if (this.props.onKeyDown) {
                    this.props.onKeyDown(e);
                }
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
                this.clear();
                this.setState({presentationType: 'text'});
                e.preventDefault();
                e.stopPropagation();
            } else if (this.props.onKeyDown) {
                this.props.onKeyDown(e);
            }
        } else if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    handleReceivedSuggestions = (suggestions) => {
        const newComponents = [];
        const newPretext = [];
        for (let i = 0; i < suggestions.terms.length; i++) {
            newComponents.push(suggestions.component);
            newPretext.push(suggestions.matchedPretext);
        }
        const terms = suggestions.terms;
        const items = suggestions.items;
        let selection = this.state.selection;
        if (terms.length > 0) {
            // if the current selection is no longer in the map, select the first term in the list
            if (!this.state.selection || terms.indexOf(this.state.selection) === -1) {
                selection = terms[0];
            }
        } else if (this.state.selection) {
            selection = '';
        }

        this.setState({
            cleared: false,
            selection,
            terms,
            items,
            components: newComponents,
            matchedPretext: newPretext,
        });

        return {selection, matchedPretext: suggestions.matchedPretext};
    }

    handleReceivedSuggestionsAndComplete = (suggestions) => {
        const {selection, matchedPretext} = this.handleReceivedSuggestions(suggestions);
        if (selection) {
            this.handleCompleteWord(selection, matchedPretext);
        }
    }

    nonDebouncedPretextChanged = (pretext, complete = false) => {
        this.pretext = pretext;
        let handled = false;
        let callback = this.handleReceivedSuggestions;
        if (complete) {
            callback = this.handleReceivedSuggestionsAndComplete;
        }
        for (const provider of this.props.providers) {
            handled = provider.handlePretextChanged(pretext, callback) || handled;

            if (handled) {
                this.setState({
                    presentationType: provider.presentationType(),
                    allowDividers: provider.allowDividers(),
                });

                break;
            }
        }
        if (!handled) {
            this.clear();
        }
    }

    debouncedPretextChanged = (pretext) => {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.nonDebouncedPretextChanged(pretext), Constants.SEARCH_TIMEOUT_MILLISECONDS);
    };

    handlePretextChanged = (pretext) => {
        this.pretext = pretext;
        this.debouncedPretextChanged(pretext);
    }

    blur = () => {
        this.props.editorRef.current.getWrappedInstance().blur();
    }

    setContainerRef = (container) => {
        // Attach/detach event listeners that aren't supported by React
        if (this.container) {
            this.container.removeEventListener('focusin', this.handleFocusIn);
            this.container.removeEventListener('focusout', this.handleFocusOut);
        }

        if (container) {
            container.addEventListener('focusin', this.handleFocusIn);
            container.addEventListener('focusout', this.handleFocusOut);
        }

        // Save ref
        this.container = container;

        // Blur and focus so that handleFocusIn is called for the first time -- for every editor except
        // the main creat_post, the editor is focused before this has a chance to fire, and then
        // the SuggestionList's prop `open` is not set to `true` until the next focusing event
        this.props.editorRef.current.getWrappedInstance().blur();
        this.props.editorRef.current.getWrappedInstance().focus();
    };

    render() {
        const {
            listComponent,
            dateComponent,
            listStyle,
            renderNoResults,
            editorRef,
            ...props
        } = this.props;

        const renderDividers = this.props.renderDividers && this.state.allowDividers;

        // Don't pass props used by SuggestionBox
        Reflect.deleteProperty(props, 'providers');

        // TODO: if onChange isn't passed, why was it sent to the textarea?
        Reflect.deleteProperty(props, 'onChange'); // We use onInput instead of onChange on the actual input
        Reflect.deleteProperty(props, 'onComposition');
        Reflect.deleteProperty(props, 'onItemSelected');
        Reflect.deleteProperty(props, 'completeOnTab');
        Reflect.deleteProperty(props, 'isRHS');
        Reflect.deleteProperty(props, 'requiredCharacters');
        Reflect.deleteProperty(props, 'openOnFocus');
        Reflect.deleteProperty(props, 'openWhenEmpty');
        Reflect.deleteProperty(props, 'onFocus');
        Reflect.deleteProperty(props, 'onBlur');
        Reflect.deleteProperty(props, 'containerClass');
        Reflect.deleteProperty(props, 'replaceAllInputOnSelect');
        Reflect.deleteProperty(props, 'renderDividers');
        Reflect.deleteProperty(props, 'contextId');
        Reflect.deleteProperty(props, 'listenForMentionKeyClick');

        // This needs to be upper case so React doesn't think it's an html tag
        const SuggestionListComponent = listComponent;
        const SuggestionDateComponent = dateComponent;

        return (
            <div
                ref={this.setContainerRef}
                className={this.props.containerClass}
            >
                <QuillEditor
                    ref={editorRef}
                    id={props.id}
                    key={props.id}
                    className={props.className}
                    spellCheck={props.spellCheck}
                    placeholder={props.placeholder}
                    onKeyPress={props.onKeyPress}
                    onKeyDown={this.handleKeyDown}
                    style={props.style}
                    value={props.value}
                    disabled={props.disabled}
                    maxLength={props.maxLength}
                    onChange={this.handleChange}
                    onCompositionStart={this.handleCompositionStart}
                    onCompositionUpdate={this.handleCompositionUpdate}
                    onCompositionEnd={this.handleCompositionEnd}
                />
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.state.presentationType === 'text' &&
                <SuggestionListComponent
                    ref='list'
                    open={this.state.focused}
                    pretext={this.pretext}
                    location={listStyle}
                    renderDividers={renderDividers}
                    renderNoResults={renderNoResults}
                    onCompleteWord={this.handleCompleteWord}
                    cleared={this.state.cleared}
                    matchedPretext={this.state.matchedPretext}
                    items={this.state.items}
                    terms={this.state.terms}
                    selection={this.state.selection}
                    components={this.state.components}
                />
                }
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.state.presentationType === 'date' &&
                <SuggestionDateComponent
                    ref='date'
                    items={this.state.items}
                    terms={this.state.terms}
                    components={this.state.components}
                    matchedPretext={this.state.matchedPretext}
                    onCompleteWord={this.handleCompleteWord}
                />
                }
            </div>
        );
    }
}
