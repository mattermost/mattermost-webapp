// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Adapter from 'enzyme-adapter-react-15';
import {configure} from 'enzyme';

configure({adapter: new Adapter()});

const supportedCommands = ['copy'];

Object.defineProperty(document, 'queryCommandSupported', {
  value: (cmd) => supportedCommands.includes(cmd)
});

Object.defineProperty(document, 'execCommand', {
  value: (cmd) => supportedCommands.includes(cmd)
});
