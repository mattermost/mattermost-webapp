// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import hlJS from 'highlight.js/lib/core';
import swift from 'highlight.js/lib/languages/swift';
import javascript from 'highlight.js/lib/languages/javascript';

import {highlight} from './syntax_highlighting';

jest.mock('highlight.js/lib/core', () => {
    const originalModule = jest.requireActual('highlight.js/lib/core');
    return {
        __esModule: true,
        ...originalModule,
        default: {
            ...originalModule.default,
            highlight: jest.fn(() => ({value: ''})),
            registerLanguage: jest.fn(),
        },
    };
});

describe('utils/syntax_highlighting.tsx', () => {
    it('should register full name language', async () => {
        await highlight('swift', '');

        expect(hlJS.registerLanguage).toHaveBeenCalledWith('swift', swift);
    });

    it('should register alias language', async () => {
        await highlight('js', '');

        expect(hlJS.registerLanguage).toHaveBeenCalledWith('javascript', javascript);
    });
});
