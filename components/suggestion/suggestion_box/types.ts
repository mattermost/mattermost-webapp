// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {QuickInputState} from '../../quick_input';
import Provider from '../provider';

export interface ISuggestionBoxProps{

    /**
     * The list component to render, usually SuggestionList
     */
    listComponent: any,

    /**
     * The date component to render
     */
    dateComponent?: any,

    /**
     * The input component to render (it is passed through props to the QuickInput)
     */
    inputComponent?: any;

    /**
     * The value of in the input
     */
    value: string;

    /**
     * Array of suggestion providers
     */
    providers: Provider[],

    /**
     * Where the list will be displayed relative to the input box, defaults to 'top'
     */
    listStyle?: string;

    /**
     * CSS class for the div parent of the input box
     */
    containerClass?: string;

    /**
     * Set to true to draw dividers between types of list items, defaults to false
     */
    renderDividers?: boolean;

    /**
     * Set to true to render a message when there were no results found, defaults to false
     */
    renderNoResults?: boolean;

    /**
     * Set to allow TAB to select an item in the list, defaults to true
     */
    completeOnTab?: boolean;

    /**
     * Flags if the suggestion_box is for the RHS (Reply).
     */
    isRHS?: boolean;

    /**
     * The number of characters required to show the suggestion list, defaults to 1
     */
    requiredCharacters?: number;

    /**
     * If true, the suggestion box is opened on focus, default to false
     */
    openOnFocus?: boolean;

    /**
     * If true, the suggestion box is disabled
     */
    disabled?: boolean;

    /**
     * If true, it displays allow to display a default list when empty
     */
    openWhenEmpty?: boolean;

    /**
     * If true, replace all input in the suggestion box with the selected option after a select, defaults to false
     */
    replaceAllInputOnSelect?: boolean;

    /**
     * An optional, opaque identifier that distinguishes the context in which the suggestion
     * box is rendered. This allows the reused component to otherwise respond to changes.
     */
    contextId?: string;

    /**
     * If true, listen for clicks on a mention and populate the input with said mention, defaults to false
     */
    listenForMentionKeyClick?: boolean;

    /**
     * Passes the wrapper reference for height calculation
     */
    wrapperHeight?: number;

    /**
     * Allows parent to access received suggestions
     */
    onSuggestionsReceived?: (suggestions: any) => void;

    /**
     * To show suggestions even when focus is lost
     */
    forceSuggestionsWhenBlur?: boolean;

    /**
     * Function called when input box gains focus
     */
    onFocus?: (e?: React.FocusEvent) => void;

    /**
     * Function called when input box loses focus
     */
    onBlur?: (e?: React.FocusEvent) => void;

    /**
     * Function called when input box value changes
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement | any>) => void;

    /**
     * Function called when a key is pressed and the input box is in focus
     */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    onComposition?: () => void;
    onSelect?: (e: React.SyntheticEvent) => void;

    /**
     * Function called when an item is selected
     */
    onItemSelected?: (item: any) => void;
}

export interface ISuggestionBoxState {
    focused: boolean,
    matchedPretext: string[],
    items: any[],
    terms: string[],
    components: any[],
    selection: string,
    allowDividers: boolean,
    presentationType: string,
}

export interface IRefHandler{
    focus: () => void;
    getTextbox: () => HTMLInputElement;
    blur: () => void;
}

export interface IInputModifier{
    replaceText: (state: QuickInputState, term: string) => QuickInputState;
    addTextAtCaret: (
        state: QuickInputState, term: string, matchedPretext: string
    ) => QuickInputState
}
