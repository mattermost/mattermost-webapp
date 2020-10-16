// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
interface ITextboxState{
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
}

const defaultTextboxState: ITextboxState = {
    value: '',
    selectionEnd: null,
    selectionStart: null,
};

export class QuickInputState {
    private textboxState: ITextboxState = defaultTextboxState;

    private constructor(initialState: Partial<ITextboxState> = defaultTextboxState) {
        this.textboxState = {
            value: initialState.value || defaultTextboxState.value,
            selectionStart: initialState.selectionStart || defaultTextboxState.selectionStart,
            selectionEnd: initialState.selectionEnd || defaultTextboxState.selectionEnd,
        };
    }

    getTextboxState() {
        return this.textboxState;
    }
    getSelection() {
        return {
            selectionStart: this.textboxState.selectionStart,
            selectionEnd: this.textboxState.selectionEnd,
        };
    }
    getValue() {
        return this.textboxState.value;
    }

    static createNew(initialState: Partial<ITextboxState> = defaultTextboxState) {
        return new QuickInputState(initialState);
    }
    static replace(qInputState: QuickInputState, newTextboxState: Partial<ITextboxState>) {
        return new QuickInputState({
            ...qInputState.getTextboxState(),
            ...newTextboxState,
        });
    }
}
