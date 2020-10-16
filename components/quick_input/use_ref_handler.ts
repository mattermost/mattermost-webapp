// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useImperativeHandle} from 'react';

export const useRefHandler = (
    // reference pass from parents
    ref: ((instance: unknown) => void) | React.MutableRefObject<unknown> | null,
    inputRef: React.MutableRefObject<HTMLInputElement | undefined>,
) => {
    useImperativeHandle(ref, () => ({
        get value() {
            return inputRef.current?.value;
        },
        set value(value: string | undefined) {
            if (inputRef.current) {
                inputRef.current.value = value || '';
            }
        },
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        getInput: () => inputRef.current,
        setInput: (input: HTMLInputElement) => {
            inputRef.current = input;
        },
    }), []);
};
