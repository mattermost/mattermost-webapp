// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';

export const useGlobalKeyPressed = (key: string | ((e: KeyboardEvent) => boolean)) => {
    const [pressed, setPressed] = useState(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (typeof key === 'string' ? e.key === key : key(e)) {
            setPressed(true);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (typeof key === 'string' ? e.key === key : key(e)) {
            setPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [key]);

    return pressed;
};
