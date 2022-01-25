// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const KeyCodes: Record<string, [string, number]> = {
    ENTER: ['Enter', 13],
    COMPOSING: ['Composing', 229],
};

// This is extracted from utils file to remove dependency on utils file of webapp
export function isKeyPressed(event: KeyboardEvent, key: [string, number]): boolean {
    // There are two types of keyboards
    // 1. English with different layouts(Ex: Dvorak)
    // 2. Different language keyboards(Ex: Russian)

    if (event.keyCode === KeyCodes.COMPOSING[1]) {
        return false;
    }

    // checks for event.key for older browsers and also for the case of different English layout keyboards.
    if (typeof event.key !== 'undefined' && event.key !== 'Unidentified' && event.key !== 'Dead') {
        const isPressedByCode = event.key === key[0] || event.key === key[0].toUpperCase();
        if (isPressedByCode) {
            return true;
        }
    }

    // used for different language keyboards to detect the position of keys
    return event.keyCode === key[1];
}
