// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import EmailsInput from './emails_input.jsx';

describe('components/widgets/inputs/EmailsInput', () => {
    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <EmailsInput
                placeholder='test'
                onChange={jest.fn()}
                value={['test@email.com', 'other-email@email.com']}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<StateManager
  className="EmailsInput"
  classNamePrefix="emails-input"
  components={
    Object {
      "IndicatorsContainer": [Function],
      "MultiValueLabel": [Function],
      "NoOptionsMessage": [Function],
    }
  }
  defaultInputValue=""
  defaultMenuIsOpen={false}
  defaultValue={null}
  formatCreateLabel={[Function]}
  isClearable={false}
  isMulti={true}
  isValidNewOption={[Function]}
  onChange={[Function]}
  placeholder="test"
  value={
    Array [
      Object {
        "label": "test@email.com",
        "value": "test@email.com",
      },
      Object {
        "label": "other-email@email.com",
        "value": "other-email@email.com",
      },
    ]
  }
/>
`);
    });
});
