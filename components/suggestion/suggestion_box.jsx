// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import QuickInput from 'components/quick_input.jsx';
import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import {EXECUTE_CURRENT_COMMAND_ITEM_ID} from './command_provider';
const KeyCodes = Constants.KeyCodes;

export default class SuggestionBox extends React.PureComponent {
    static propTypes = {

        /**
         * The list component to render, usually SuggestionList
         */
        listComponent: PropTypes.func.isRequired,

        /**
         * The input component to render (it is passed through props to the QuickInput)
         */
        inputComponent: PropTypes.elementType,

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
        providers: PropTypes.arrayOf(PropTypes.object).isRequired,

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

        onSelect: PropTypes.func,

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
         * Passes the wrapper reference for height calculation
         */
        wrapperHeight: PropTypes.number,

        /**
         * Allows parent to access received suggestions
         */
        onSuggestionsReceived: PropTypes.func,

        /**
         * To show suggestions even when focus is lost
         */
        forceSuggestionsWhenBlur: PropTypes.bool,
    }

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
        forceSuggestionsWhenBlur: false,
    }

    constructor(props) {
        super(props);
        this.suggestionReadOut = React.createRef();

        // Keep track of whether we're composing a CJK character so we can make suggestions for partial characters
        this.composing = false;

        this.pretext = '';

        // Used for debouncing pretext changes
        this.timeoutId = '';

        // Used for preventing suggestion list to close when scrollbar is clicked
        this.preventSuggestionListCloseFlag = false;

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

        this.inputRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.listenForMentionKeyClick) {
            EventEmitter.addListener('mention_key_click', this.handleMentionKeyClick);
        }
        this.handlePretextChanged(this.pretext);
    }

    componentWillUnmount() {
        EventEmitter.removeListener('mention_key_click', this.handleMentionKeyClick);
    }

    componentDidUpdate(prevProps) {
        const {value} = this.props;

        // Post was just submitted, update pretext property.
        if (value === '' && this.pretext !== value) {
            this.handlePretextChanged(value);
            return;
        }

        if (prevProps.contextId !== this.props.contextId) {
            const textbox = this.getTextbox();
            const pretext = textbox.value.substring(0, textbox.selectionEnd).toLowerCase();

            this.handlePretextChanged(pretext);
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

        this.addTextAtCaret(insertText, '');
    }

    getTextbox = () => {
        if (!this.inputRef.current) {
            return null;
        }

        const input = this.inputRef.current.getInput();

        if (input.getDOMNode) {
            return input.getDOMNode();
        }

        return input;
    }

    recalculateSize = () => {
        // Pretty hacky way to force an AutosizeTextarea to recalculate its height if that's what
        // we're rendering as the input
        const input = this.inputRef.current.getInput();

        if (input.recalculateSize) {
            input.recalculateSize();
        }
    }

    handleEmitClearSuggestions = (delay = 0) => {
        setTimeout(() => {
            this.clear();
        }, delay);
    }

    preventSuggestionListClose = () => {
        this.preventSuggestionListCloseFlag = true;
    }

    handleFocusOut = (e) => {
        if (this.preventSuggestionListCloseFlag) {
            this.preventSuggestionListCloseFlag = false;
            return;
        }

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

        if (!this.props.forceSuggestionsWhenBlur) {
            this.handleEmitClearSuggestions();
        }

        this.setState({focused: false});

        if (this.props.onBlur) {
            this.props.onBlur();
        }
    };

    handleFocusIn = (e) => {
        // Focus is switching FROM e.relatedTarget, so only treat this as a focus event if we're not switching
        // between children (like from the textbox to the suggestion list). PreventSuggestionListCloseFlag is
        // checked because if true, it means that the focusIn comes from a click in the suggestion box, an
        // option choice, so we don't want the focus event to be triggered
        if (this.container.contains(e.relatedTarget) || this.preventSuggestionListCloseFlag) {
            return;
        }

        this.setState({focused: true});

        if (this.props.openOnFocus || this.props.openWhenEmpty) {
            setTimeout(() => {
                const textbox = this.getTextbox();
                if (textbox) {
                    const pretext = textbox.value.substring(0, textbox.selectionEnd);
                    if (this.props.openWhenEmpty || pretext.length >= this.props.requiredCharacters) {
                        if (this.pretext !== pretext) {
                            this.handlePretextChanged(pretext);
                        }
                    }
                }
            });
        }

        if (this.props.onFocus) {
            this.props.onFocus();
        }
    };

    handleChange = (e) => {
        const textbox = this.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionEnd).toLowerCase();

        if (!this.composing && this.pretext !== pretext) {
            this.handlePretextChanged(pretext);
        }

        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    handleCompositionStart = () => {
        this.composing = true;
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    handleCompositionUpdate = (e) => {
        if (!e.data) {
            return;
        }

        // The caret appears before the CJK character currently being composed, so re-add it to the pretext
        const textbox = this.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionStart) + e.data;

        this.handlePretextChanged(pretext);
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    handleCompositionEnd = () => {
        this.composing = false;
        if (this.props.onComposition) {
            this.props.onComposition();
        }
    }

    addTextAtCaret = (term, matchedPretext) => {
        const textbox = this.getTextbox();
        const caret = textbox.selectionEnd;
        const text = this.props.value;
        const pretext = textbox.value.substring(0, textbox.selectionEnd);

        let prefix;
        let keepPretext = false;
        if (pretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
            prefix = pretext.substring(0, pretext.length - matchedPretext.length);
        } else {
            // the pretext has changed since we got a term to complete so see if the term still fits the pretext
            const termWithoutMatched = term.substring(matchedPretext.length);
            const overlap = SuggestionBox.findOverlap(pretext, termWithoutMatched);

            keepPretext = overlap.length === 0;
            prefix = pretext.substring(0, pretext.length - overlap.length - matchedPretext.length);
        }

        const suffix = text.substring(caret);

        let newValue;
        if (keepPretext) {
            newValue = pretext;
        } else {
            newValue = prefix + term + ' ' + suffix;
        }

        textbox.value = newValue;

        if (this.props.onChange) {
            // fake an input event to send back to parent components
            const e = {
                target: textbox,
            };

            // don't call handleChange or we'll get into an event loop
            this.props.onChange(e);
        }

        // set the caret position after the next rendering
        window.requestAnimationFrame(() => {
            if (textbox.value === newValue) {
                Utils.setCaretPosition(textbox, prefix.length + term.length + 1);
            }
        });
    }

    replaceText = (term) => {
        const textbox = this.getTextbox();
        textbox.value = term;

        if (this.props.onChange) {
            // fake an input event to send back to parent components
            const e = {
                target: textbox,
            };

            // don't call handleChange or we'll get into an event loop
            this.props.onChange(e);
        }
    }

    handleCompleteWord = (term, matchedPretext, e) => {
        let fixedTerm = term;
        let finish = false;
        if (term.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            fixedTerm = term.substring(0, term.length - EXECUTE_CURRENT_COMMAND_ITEM_ID.length);
            finish = true;
        }
        if (this.props.replaceAllInputOnSelect) {
            this.replaceText(fixedTerm);
        } else {
            this.addTextAtCaret(fixedTerm, matchedPretext);
        }

        if (this.props.onItemSelected) {
            const items = this.state.items;
            const terms = this.state.terms;
            for (let i = 0; i < terms.length; i++) {
                if (terms[i] === fixedTerm) {
                    this.props.onItemSelected(items[i]);
                    break;
                }
            }
        }

        this.clear();

        this.inputRef.current.focus();

        if (finish && this.props.onKeyPress) {
            let ke = e;
            if (!e || Utils.isKeyPressed(e, Constants.KeyCodes.TAB)) {
                ke = new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, keyCode: 13,
                });
                if (e) {
                    e.preventDefault();
                }
            }
            this.props.onKeyPress(ke);
            return true;
        }

        if (!finish) {
            for (const provider of this.props.providers) {
                if (provider.handleCompleteWord) {
                    provider.handleCompleteWord(fixedTerm, matchedPretext, this.handlePretextChanged);
                }
            }
        }
        return false;
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

    setSelection = (term) => {
        this.setState({
            selection: term,
        });
    }

    clear = () => {
        if (!this.state.cleared) {
            this.setState({
                cleared: true,
                matchedPretext: [],
                terms: [],
                items: [],
                components: [],
                selection: '',
            });
            this.handlePretextChanged('');
        }
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
                if (this.pretext.toLowerCase().endsWith(matchedPretext.toLowerCase())) {
                    if (this.handleCompleteWord(this.state.selection, matchedPretext, e)) {
                        return;
                    }
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

    handleSelect = (e) => {
        if (this.props.onSelect) {
            this.props.onSelect(e);
        }
    }

    handleReceivedSuggestions = (suggestions) => {
        const newComponents = [];
        const newPretext = [];
        if (this.props.onSuggestionsReceived) {
            this.props.onSuggestionsReceived(suggestions);
        }

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
        this.inputRef.current.blur();
    }

    focus = () => {
        const input = this.inputRef.current.input;
        if (input.value === '""' || input.value.endsWith('""')) {
            input.selectionStart = input.value.length - 1;
            input.selectionEnd = input.value.length - 1;
        } else {
            input.selectionStart = input.value.length;
        }
        input.focus();

        this.handleChange({target: this.inputRef.current});
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
    };

    render() {
        const {
            listComponent,
            dateComponent,
            listStyle,
            renderNoResults,
            ...props
        } = this.props;

        const renderDividers = this.props.renderDividers && this.state.allowDividers;

        // Don't pass props used by SuggestionBox
        Reflect.deleteProperty(props, 'providers');
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
        Reflect.deleteProperty(props, 'wrapperHeight');
        Reflect.deleteProperty(props, 'forceSuggestionsWhenBlur');
        Reflect.deleteProperty(props, 'onSuggestionsReceived');

        // This needs to be upper case so React doesn't think it's an html tag
        const SuggestionListComponent = listComponent;
        const SuggestionDateComponent = dateComponent;

        return (
            <div
                ref={this.setContainerRef}
                className={this.props.containerClass}
            >
                <div
                    ref={this.suggestionReadOut}
                    aria-live='polite'
                    role='alert'
                    className='sr-only'
                />
                <QuickInput
                    ref={this.inputRef}
                    autoComplete='off'
                    {...props}
                    onInput={this.handleChange}
                    onCompositionStart={this.handleCompositionStart}
                    onCompositionUpdate={this.handleCompositionUpdate}
                    onCompositionEnd={this.handleCompositionEnd}
                    onKeyDown={this.handleKeyDown}
                    onSelect={this.handleSelect}
                />
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.state.presentationType === 'text' &&
                    <div style={{width: this.state.width}}>
                        <SuggestionListComponent
                            ariaLiveRef={this.suggestionReadOut}
                            open={this.state.focused || this.props.forceSuggestionsWhenBlur}
                            pretext={this.pretext}
                            location={listStyle}
                            renderDividers={renderDividers}
                            renderNoResults={renderNoResults}
                            onCompleteWord={this.handleCompleteWord}
                            preventClose={this.preventSuggestionListClose}
                            onItemHover={this.setSelection}
                            cleared={this.state.cleared}
                            matchedPretext={this.state.matchedPretext}
                            items={this.state.items}
                            terms={this.state.terms}
                            selection={this.state.selection}
                            components={this.state.components}
                            wrapperHeight={this.props.wrapperHeight}
                            inputRef={this.inputRef}
                            onLoseVisibility={this.blur}
                        />
                    </div>
                }
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.state.presentationType === 'date' &&
                    <SuggestionDateComponent
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

    // Finds the longest substring that's at both the end of b and the start of a. For example,
    // if a = "firepit" and b = "pitbull", findOverlap would return "pit".
    static findOverlap(a, b) {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        for (let i = bLower.length; i > 0; i--) {
            const substring = bLower.substring(0, i);

            if (aLower.endsWith(substring)) {
                return substring;
            }
        }

        return '';
    }
}
