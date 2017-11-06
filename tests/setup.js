// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Adapter from 'enzyme-adapter-react-15';
import {configure} from 'enzyme';

configure({adapter: new Adapter()});

var documentMock = (function() {
    const supportedCommands = ['copy'];

    return {
        queryCommandSupported(cmd) {
            return supportedCommands.includes(cmd);
        },
        execCommand(cmd) {
            return supportedCommands.includes(cmd);
        }
    };
}());

Object.defineProperty(window, 'document', {value: documentMock});
