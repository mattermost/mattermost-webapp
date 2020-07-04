// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
// This code is heavily based on the undoredu.js library from
// https://github.com/iMrDJAi/UndoRedo.js with MIT license and copyrighted by
// ${Mr.DJA}

type HistoryData = {
    stack: InputData[];
    currentNumber: number;
    currentCooldownNumber: number;
};

type InputData = {
    message: string;
    caretPosition: number;
}

export default class History {
    stack: InputData[];
    currentNumber: number;
    currentCooldownNumber: number;
    cooldownNumber: number;

    constructor(initialValue: InputData, cooldownNumber: number) {
        this.cooldownNumber = cooldownNumber;
        this.stack = [initialValue];
        this.currentNumber = 0;
        this.currentCooldownNumber = 0;
    }

    record = (data: InputData, force: boolean) => {
        if (this.currentNumber === this.stack.length - 1) { //checking for regular history updates
            if ((this.currentCooldownNumber >= this.cooldownNumber || this.currentCooldownNumber === 0) && force !== true) { //history updates after a new cooldown
                this.stack.push(data);
                this.currentNumber++;
                this.currentCooldownNumber = 1;
            } else if (this.currentCooldownNumber < this.cooldownNumber && force !== true) { //history updates during cooldown
                this.current(data);
                this.currentCooldownNumber++;
            } else if (force === true) { //force to record without cooldown
                this.stack.push(data);
                this.currentNumber++;
                this.currentCooldownNumber = this.cooldownNumber;
            }
        } else if (this.currentNumber < this.stack.length - 1) { //checking for history updates after undo
            if (force !== true) { //history updates after undo
                this.stack.length = this.currentNumber + 1;
                this.stack.push(data);
                this.currentNumber++;
                this.currentCooldownNumber = 1;
            } else if (force === true) { ////force to record after undo
                this.stack.length = this.currentNumber + 1;
                this.stack.push(data);
                this.currentNumber++;
                this.currentCooldownNumber = this.cooldownNumber;
            }
        }
    }

    undo = (readOnly: boolean): InputData => {
        if (this.currentNumber > 0) {
            if (readOnly) {
                return this.stack[this.currentNumber - 1];
            }
            this.currentNumber--;
            return this.stack[this.currentNumber];
        }
        return this.stack[this.currentNumber];
    }

    redo = (readOnly: boolean): InputData => {
        if (this.currentNumber < this.stack.length - 1) {
            if (readOnly) {
                return this.stack[this.currentNumber + 1];
            }
            this.currentNumber++;
            return this.stack[this.currentNumber];
        }
        return this.stack[this.currentNumber];
    }

    current = (data?: InputData): InputData => {
        if (data) {
            this.stack[this.currentNumber] = data;
        }
        return this.stack[this.currentNumber];
    }

    reset = (initialValue?: InputData) => {
        this.stack = [initialValue || {message: '', caretPosition: 0}];
        this.currentNumber = 0;
        this.currentCooldownNumber = 0;
    }

    save = (): HistoryData => {
        return {
            stack: this.stack,
            currentNumber: this.currentNumber,
            currentCooldownNumber: this.currentCooldownNumber,
        };
    }

    restore = (data: HistoryData) => {
        this.stack = data.stack;
        this.currentNumber = data.currentNumber;
        this.currentCooldownNumber = data.currentCooldownNumber;
    }
}
