// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NewPostDraft} from 'types/store/draft';

import {PostType} from '../file_upload';

import Wysiwyg, {WysiwygConfig} from './wysiwyg';

jest.mock('localforage', () => {
    const actual = jest.requireActual('localforage');

    return {
        ...actual,
        ready: jest.fn().mockResolvedValue(true),
        supports: jest.fn().mockResolvedValue(true),
    };
});

const wysiwygConfig: WysiwygConfig = {
    enterHandling: {
        ctrlSend: true,
        codeBlockOnCtrlEnter: true,
    },
    suggestions: {
        mention: {
            teamId: 'teamId',
            channelId: 'channelId',
            useSpecialMentions: false,
            useGroupMentions: false,
        },
        channel: {teamId: 'teamId'},
        command: {
            teamId: 'teamId',
            channelId: 'channelId',
        },
    },
    fileUpload: {
        rootId: '',
        channelId: 'channelId',
        postType: PostType.post,
    },
    enablePriority: false,
    enableEmojiPicker: false,
    useCustomEmojis: false,
    locale: 'en',
};

const props = {
    onSubmit: jest.fn(),
    onChange: jest.fn(),
    onAttachmentChange: jest.fn(),
    config: wysiwygConfig,
    readOnly: false,
    draft: {
        message: '',
    } as NewPostDraft,
    placeholder: 'Write to test-channel',
};

describe('WYSIWYG editor', () => {
    it('matches snapshot', () => {
        const wrapper = shallow(<Wysiwyg {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
