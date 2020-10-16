// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

export const useRefHandler = (
    ref: ((instance: unknown) => void) | React.MutableRefObject<unknown> | null,
    quickInputRef: React.MutableRefObject<any>,
) => {
    const getTextbox = React.useCallback(() => {
        if (!quickInputRef.current) {
            return null;
        }
        const input = quickInputRef.current?.getInput();
        if (input.getDOMNode) {
            return input.getDOMNode();
        }
        return input;
    }, []);

    const blur = React.useCallback(() => {
 quickInputRef.current?.blur();
    }, [quickInputRef]);
    const focus = React.useCallback(() => {
 quickInputRef.current?.focus();
    }, [quickInputRef]);
    const recalculateSize = React.useCallback(() => {
        const input = quickInputRef.current?.getInput();
        if (input.recalculateSize) {
            input.recalculateSize();
        }
    }, []);

    const resultHandler = {getTextbox, blur, focus, recalculateSize};

    React.useImperativeHandle(ref, () => resultHandler, [quickInputRef]);
    return resultHandler;
};
