// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';
import {Instance} from '@popperjs/core';

import {debounce} from 'lodash';

import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';

import {FormattingIcon} from './formatting_icon';

type WideMode = 'wide' | 'normal' | 'narrow';

const useResponsiveFormattingBar = (ref: React.RefObject<HTMLDivElement>): WideMode => {
    const [wideMode, setWideMode] = useState<WideMode>('wide');
    const handleResize = debounce(() => {
        if (ref.current?.clientWidth === undefined) {
            return;
        }

        if (ref.current.clientWidth > 640) {
            setWideMode('wide');
        }

        if (ref.current.clientWidth >= 424 && ref.current.clientWidth <= 640) {
            setWideMode('normal');
        }

        if (ref.current.clientWidth < 424) {
            setWideMode('narrow');
        }
    }, 100);
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return wideMode;
};

interface Control {
    markdownMode: ApplyMarkdownOptions['markdownMode'];
    icon: React.ReactNode;
}

const MAP_WIDE_MODE_TO_CONTROLS_QUANTITY: {[key in WideMode]: number} = {
    wide: 9,
    normal: 5,
    narrow: 3,
};

export const useFormattingBarControls = (
    formattingBarRef: React.RefObject<HTMLDivElement>,
): {
    controls: Control[];
    hiddenControls: Control[];
    wideMode: WideMode;
} => {
    const wideMode = useResponsiveFormattingBar(formattingBarRef);

    const allControls: Control[] = [
        {
            markdownMode: 'bold',
            icon: <FormattingIcon type='bold'/>,
        },
        {
            markdownMode: 'italic',
            icon: <FormattingIcon type='italic'/>,
        },
        {
            markdownMode: 'strike',
            icon: <FormattingIcon type='strike'/>,
        },
        {
            markdownMode: 'heading',
            icon: <FormattingIcon type='heading'/>,
        },
        {
            markdownMode: 'link',
            icon: <FormattingIcon type='link'/>,
        },
        {
            markdownMode: 'code',
            icon: <FormattingIcon type='code'/>,
        },
        {
            markdownMode: 'quote',
            icon: <FormattingIcon type='quote'/>,
        },
        {
            markdownMode: 'ul',
            icon: <FormattingIcon type='ul'/>,
        },
        {
            markdownMode: 'ol',
            icon: <FormattingIcon type='ol'/>,
        },
    ];

    const controlsLength = MAP_WIDE_MODE_TO_CONTROLS_QUANTITY[wideMode];

    const controls = allControls.slice(0, controlsLength);
    const hiddenControls = allControls.slice(controlsLength);

    return {
        controls,
        hiddenControls,
        wideMode,
    };
};

export const useUpdateOnVisibilityChange = (update: Instance['update'] | null, isVisible: boolean) => {
    const updateComponent = async () => {
        if (!update) {
            return;
        }
        await update();
    };

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        updateComponent();
    }, [isVisible]);
};
