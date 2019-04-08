// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Quill from 'quill';

import EmojiBlot from './emoji_blot.js';

export const initializeBlots = () => {
    Quill.register({
        'formats/emojiblot': EmojiBlot,
    });
};
