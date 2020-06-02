// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddCommand from 'components/integrations/add_command/add_command.jsx';

describe('components/integrations/AddCommand', () => {
    test('should match snapshot', () => {
        const emptyFunction = jest.fn();

        const wrapper = shallow(
            <AddCommand
                team={{name: 'test'}}
                addCommandRequest={{
                    status: 'not_started',
                    error: null,
                }}
                actions={{addCommand: emptyFunction}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
