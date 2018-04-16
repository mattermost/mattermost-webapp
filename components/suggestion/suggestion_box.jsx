// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as GlobalActions from 'actions/global_actions.jsx';
import QuickInput from 'components/quick_input.jsx';
import SuggestionStore from 'stores/suggestion_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;

export default class SuggestionBox extends React.Component {
    static propTypes = {

        /**
         * The list component to render, usually SuggestionList
         */
        listComponent: PropTypes.func.isRequired,

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
         * Set to true to draw dividers between types of list items, defaults to false
         */
        renderDividers: PropTypes.bool,

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

        /**
         * Function called when an item is selected
         */
        onItemSelected: PropTypes.func,

        /**
         * Flags if the suggestion_box is for the RHS (Reply).
         */
        isRHS: PropTypes.bool,

        /**
         * Function called when @mention is clicked
         */
        popoverMentionKeyClick: PropTypes.bool,

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
    }

    static defaultProps = {
        listStyle: 'top',
        renderDividers: false,
        completeOnTab: true,
        isRHS: false,
        requiredCharacters: 1,
        openOnFocus: false,
        openWhenEmpty: false,
    }

    constructor(props) {
        super(props);

        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

        this.handlePopoverMentionKeyClick = this.handlePopoverMentionKeyClick.bind(this);
        this.handleCompleteWord = this.handleCompleteWord.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCompositionStart = this.handleCompositionStart.bind(this);
        this.handleCompositionUpdate = this.handleCompositionUpdate.bind(this);
        this.handleCompositionEnd = this.handleCompositionEnd.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handlePretextChanged = this.handlePretextChanged.bind(this);
        this.blur = this.blur.bind(this);

        this.suggestionId = Utils.generateId();
        SuggestionStore.registerSuggestionBox(this.suggestionId);

        // Keep track of whether we're composing a CJK character so we can make suggestions for partial characters
        this.composing = false;
    }

    componentDidMount() {
        if (this.props.popoverMentionKeyClick) {
            SuggestionStore.addPopoverMentionKeyClickListener(this.props.isRHS, this.handlePopoverMentionKeyClick);
        }
        SuggestionStore.addPretextChangedListener(this.suggestionId, this.handlePretextChanged);
    }

    componentWillUnmount() {
        if (this.props.popoverMentionKeyClick) {
            SuggestionStore.removePopoverMentionKeyClickListener(this.props.isRHS, this.handlePopoverMentionKeyClick);
        }
        SuggestionStore.removePretextChangedListener(this.suggestionId, this.handlePretextChanged);

        SuggestionStore.unregisterSuggestionBox(this.suggestionId);
    }

    componentDidUpdate(prevProps) {
        if (this.props.providers !== prevProps.providers) {
            const textbox = this.getTextbox();
            const pretext = textbox.value.substring(0, textbox.selectionEnd);
            GlobalActions.emitSuggestionPretextChanged(this.suggestionId, pretext);
        }
    }

    getTextbox() {
        const input = this.refs.input.getInput();

        if (input.getDOMNode) {
            return input.getDOMNode();
        }

        return input;
    }

    recalculateSize() {
        // Pretty hacky way to force an AutosizeTextarea to recalculate its height if that's what
        // we're rendering as the input
        const input = this.refs.input.getInput();

        if (input.recalculateSize) {
            input.recalculateSize();
        }
    }

    handleBlur() {
        setTimeout(() => {
            // Delay this slightly so that we don't clear the suggestions before we run click handlers on SuggestionList
            GlobalActions.emitClearSuggestions(this.suggestionId);
        }, 200);

        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    handleFocus() {
        if (this.props.openOnFocus || this.props.openWhenEmpty) {
            setTimeout(() => {
                const textbox = this.getTextbox();
                if (textbox) {
                    const pretext = textbox.value.substring(0, textbox.selectionEnd);
                    if (this.props.openWhenEmpty || pretext.length >= this.props.requiredCharacters) {
                        GlobalActions.emitSuggestionPretextChanged(this.suggestionId, pretext);
                    }
                }
            });
        }

        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    handleChange(e) {
        const textbox = this.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionEnd);

        if (!this.composing &&
            SuggestionStore.getPretext(this.suggestionId) !== pretext &&
            (this.props.openWhenEmpty || pretext.length >= this.props.requiredCharacters)
        ) {
            GlobalActions.emitSuggestionPretextChanged(this.suggestionId, pretext);
        }

        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    handleCompositionStart() {
        this.composing = true;
    }

    handleCompositionUpdate(e) {
        if (!e.data) {
            return;
        }

        // The caret appears before the CJK character currently being composed, so re-add it to the pretext
        const textbox = this.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionStart) + e.data;

        if (SuggestionStore.getPretext(this.suggestionId) !== pretext) {
            GlobalActions.emitSuggestionPretextChanged(this.suggestionId, pretext);
        }
    }

    handleCompositionEnd() {
        this.composing = false;
    }

    handlePopoverMentionKeyClick(mentionKey) {
        let insertText = '@' + mentionKey;

        // if the current text does not end with a whitespace, then insert a space
        if (this.props.value && (/[^\s]$/).test(this.props.value)) {
            insertText = ' ' + insertText;
        }

        this.addTextAtCaret(insertText, '');
    }

    addTextAtCaret(term, matchedPretext) {
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

    handleCompleteWord(term, matchedPretext) {
        this.addTextAtCaret(term, matchedPretext);

        if (this.props.onItemSelected) {
            const items = SuggestionStore.getItems(this.suggestionId);
            const terms = SuggestionStore.getTerms(this.suggestionId);
            for (let i = 0; i < terms.length; i++) {
                if (terms[i] === term) {
                    this.props.onItemSelected(items[i]);
                    break;
                }
            }
        }

        this.refs.input.focus();

        for (const provider of this.props.providers) {
            if (provider.handleCompleteWord) {
                provider.handleCompleteWord(term, matchedPretext);
            }
        }

        GlobalActions.emitCompleteWordSuggestion(this.suggestionId);
    }

    handleKeyDown(e) {
        if ((this.props.openWhenEmpty || this.props.value) && SuggestionStore.hasSuggestions(this.suggestionId)) {
            if (Utils.isKeyPressed(e, KeyCodes.UP)) {
                GlobalActions.emitSelectPreviousSuggestion(this.suggestionId);
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.DOWN)) {
                GlobalActions.emitSelectNextSuggestion(this.suggestionId);
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ENTER) || (this.props.completeOnTab && Utils.isKeyPressed(e, KeyCodes.TAB))) {
                this.handleCompleteWord(SuggestionStore.getSelection(this.suggestionId), SuggestionStore.getSelectedMatchedPretext(this.suggestionId));
                if (this.props.onKeyDown) {
                    this.props.onKeyDown(e);
                }
                e.preventDefault();
            } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
                GlobalActions.emitClearSuggestions(this.suggestionId);
                e.preventDefault();
                e.stopPropagation();
            } else if (this.props.onKeyDown) {
                this.props.onKeyDown(e);
            }
        } else if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    handlePretextChanged(pretext) {
        let handled = false;
        for (const provider of this.props.providers) {
            handled = provider.handlePretextChanged(this.suggestionId, pretext) || handled;

            if (handled) {
                break;
            }
        }

        if (!handled) {
            SuggestionStore.clearSuggestions(this.suggestionId);
        }
    }

    blur() {
        this.refs.input.blur();
    }

    render() {
        const {
            listComponent,
            listStyle,
            renderDividers,
            ...props
        } = this.props;

        // Don't pass props used by SuggestionBox
        Reflect.deleteProperty(props, 'providers');
        Reflect.deleteProperty(props, 'onChange'); // We use onInput instead of onChange on the actual input
        Reflect.deleteProperty(props, 'onItemSelected');
        Reflect.deleteProperty(props, 'completeOnTab');
        Reflect.deleteProperty(props, 'isRHS');
        Reflect.deleteProperty(props, 'popoverMentionKeyClick');
        Reflect.deleteProperty(props, 'requiredCharacters');
        Reflect.deleteProperty(props, 'openOnFocus');
        Reflect.deleteProperty(props, 'openWhenEmpty');

        // This needs to be upper case so React doesn't think it's an html tag
        const SuggestionListComponent = listComponent;

        return (
            <div>
                <QuickInput
                    ref='input'
                    autoComplete='off'
                    {...props}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    onInput={this.handleChange}
                    onCompositionStart={this.handleCompositionStart}
                    onCompositionUpdate={this.handleCompositionUpdate}
                    onCompositionEnd={this.handleCompositionEnd}
                    onKeyDown={this.handleKeyDown}
                />
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) &&
                    <SuggestionListComponent
                        suggestionId={this.suggestionId}
                        location={listStyle}
                        renderDividers={renderDividers}
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
