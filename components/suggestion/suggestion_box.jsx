// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {debounce} from 'mattermost-redux/actions/helpers';

import * as GlobalActions from 'actions/global_actions.jsx';
import QuickInput from 'components/quick_input.jsx';
import SuggestionStore from 'stores/suggestion_store.jsx';
import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;
const MIN_TIME_BEFORE_CLICK = 200;

export default class SuggestionBox extends React.Component {
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

        /**
         * If true, replace all input in the suggestion box with the selected option after a select, defaults to false
         */
        replaceAllInputOnSelect: PropTypes.bool,
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
    }

    constructor(props) {
        super(props);

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

        // Keep track of whether a list based or date based suggestion provider has been triggered
        this.presentationType = 'text';

        this.state = {
            focused: false,
        };
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

    handleEmitClearSuggestions = (suggestionId, delay = 0) => {
        setTimeout(() => {
            GlobalActions.emitClearSuggestions(suggestionId);
        }, delay);
    }

    handleFocusOut = (e) => {
        // Focus is switching TO e.relatedTarget, so only treat this as a blur event if we're not switching
        // between children (like from the textbox to the suggestion list)
        if (this.container.contains(e.relatedTarget)) {
            return;
        }

        this.setState({focused: false});

        if (UserAgent.isIos() && !e.relatedTarget) {
            // iOS doesn't support e.relatedTarget, so we need to use the old method of just delaying the
            // blur so that click handlers on the list items still register
            if (this.presentationType !== 'date' || this.props.value.length === 0) {
                this.handleEmitClearSuggestions(this.suggestionId, MIN_TIME_BEFORE_CLICK);
            }
        } else {
            this.handleEmitClearSuggestions(this.suggestionId);
        }

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
    };

    handleChange(e) {
        const textbox = this.getTextbox();
        const pretext = textbox.value.substring(0, textbox.selectionEnd);

        if (!this.composing && SuggestionStore.getPretext(this.suggestionId) !== pretext) {
            this.doEmitSuggestionPretextChanged(pretext);
        }

        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    doEmitSuggestionPretextChanged = debounce((pretext) => {
        GlobalActions.emitSuggestionPretextChanged(this.suggestionId, pretext);
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS)

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

    replaceText(term) {
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

    handleCompleteWord(term, matchedPretext) {
        if (this.props.replaceAllInputOnSelect) {
            this.replaceText(term);
        } else {
            this.addTextAtCaret(term, matchedPretext);
        }

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
                this.presentationType = 'text';
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
                if (provider.constructor.name === 'SearchDateProvider') {
                    this.presentationType = 'date';
                } else {
                    this.presentationType = 'text';
                }

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
            renderDividers,
            renderNoResults,
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
        Reflect.deleteProperty(props, 'onFocus');
        Reflect.deleteProperty(props, 'onBlur');
        Reflect.deleteProperty(props, 'containerClass');
        Reflect.deleteProperty(props, 'replaceAllInputOnSelect');

        // This needs to be upper case so React doesn't think it's an html tag
        const SuggestionListComponent = listComponent;
        const SuggestionDateComponent = dateComponent;

        return (
            <div
                ref={this.setContainerRef}
                className={this.props.containerClass}
            >
                <QuickInput
                    ref='input'
                    autoComplete='off'
                    {...props}
                    onInput={this.handleChange}
                    onCompositionStart={this.handleCompositionStart}
                    onCompositionUpdate={this.handleCompositionUpdate}
                    onCompositionEnd={this.handleCompositionEnd}
                    onKeyDown={this.handleKeyDown}
                />
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.presentationType === 'text' &&
                    <SuggestionListComponent
                        open={this.state.focused}
                        suggestionId={this.suggestionId}
                        location={listStyle}
                        renderDividers={renderDividers}
                        renderNoResults={renderNoResults}
                        onCompleteWord={this.handleCompleteWord}
                    />
                }
                {(this.props.openWhenEmpty || this.props.value.length >= this.props.requiredCharacters) && this.presentationType === 'date' &&
                    <SuggestionDateComponent
                        suggestionId={this.suggestionId}
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
