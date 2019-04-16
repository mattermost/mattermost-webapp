// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export default class Quill {
    constructor() {
        return {
            focus: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            setContents: jest.fn(),
            getContents: jest.fn(),
            getSelection: jest.fn(),
            getLeaf: jest.fn(),
            updateContents: jest.fn(),
            insertEmbed: jest.fn(),
            setSelection: jest.fn(),
            insertText: jest.fn(),
        };
    }

    static import = () => null;
    static register = () => null;
}
