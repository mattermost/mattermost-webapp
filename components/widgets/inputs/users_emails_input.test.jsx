// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

//
import UsersEmailsInput from './users_emails_input.jsx';

describe('components/widgets/inputs/UsersEmailsInput', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <UsersEmailsInput
                placeholder='test'
                ariaLabel='test'
                usersLoader={jest.fn()}
                onChange={jest.fn()}
                value={[
                    'test@email.com',
                    {
                        id: 'test-user-id',
                        username: 'test-username',
                        first_name: 'test',
                        last_name: 'user',
                    },
                ]}
            />,
        );
        expect(wrapper).toMatchInlineSnapshot(`
            <Fragment>
              <Async
                aria-label="test"
                cacheOptions={false}
                className="UsersEmailsInput"
                classNamePrefix="users-emails-input"
                components={
                  Object {
                    "IndicatorsContainer": [Function],
                    "MultiValueRemove": [Function],
                    "NoOptionsMessage": [Function],
                  }
                }
                defaultMenuIsOpen={false}
                defaultOptions={false}
                filterOption={null}
                formatOptionLabel={[Function]}
                getOptionValue={[Function]}
                isClearable={false}
                isMulti={true}
                isValidNewOption={[Function]}
                loadOptions={[Function]}
                loadingMessage={[Function]}
                onBlur={[Function]}
                onChange={[Function]}
                onFocus={[Function]}
                onInputChange={[Function]}
                openMenuOnClick={false}
                openMenuOnFocus={true}
                placeholder="test"
                tabSelectsValue={true}
                value={
                  Array [
                    Object {
                      "label": "test@email.com",
                      "value": "test@email.com",
                    },
                    Object {
                      "first_name": "test",
                      "id": "test-user-id",
                      "last_name": "user",
                      "username": "test-username",
                    },
                  ]
                }
              />
            </Fragment>
        `);
    });
});
