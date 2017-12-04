// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Adapter from 'enzyme-adapter-react-16';
import {configure} from 'enzyme';
import $ from 'jquery';

global.$ = global.jQuery = $;

configure({adapter: new Adapter()});

const supportedCommands = ['copy'];

Object.defineProperty(document, 'queryCommandSupported', {
  value: (cmd) => supportedCommands.includes(cmd)
});

Object.defineProperty(document, 'execCommand', {
  value: (cmd) => supportedCommands.includes(cmd)
});
