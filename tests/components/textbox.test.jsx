// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TestHelper from 'tests/helpers/client-test-helper';

import Textbox from 'components/textbox.jsx';

describe('components/TextBox', () => {
    test('should match snapshot with required props', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <Textbox
                id='someid'
                value='some test text'
                onChange={emptyFunction}
                onKeyPress={emptyFunction}
                characterLimit={4000}
                createMessage='placeholder text'
                supportsCommands={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should throw error when value is too long', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        // this mock function should be called when the textbox value is too long
        var gotError = false;
        function handlePostError() {
            gotError = true;
        }

        const wrapper = shallow(
            <Textbox
                id='someid'
                value='some test text'
                onChange={emptyFunction}
                onKeyPress={emptyFunction}
                characterLimit={4000}
                createMessage='placeholder text'
                supportsCommands={false}
                handlePostError={handlePostError}
            />
        );

        wrapper.find('#someid').value = TestHelper.randomString(4001);
        expect(gotError).toEqual(true);

        expect(wrapper).toMatchSnapshot();
    });
});
