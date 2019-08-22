// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import ChannelsInput from './channels_input.jsx';

describe('components/widgets/inputs/ChannelsInput', () => {
    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <ChannelsInput
                placeholder='test'
                onChange={jest.fn()}
                channelsLoader={jest.fn()}
                value={[
                    {id: 'test-channel-1', type: 'O', display_name: 'test channel 1'},
                    {id: 'test-channel-2', type: 'P', display_name: 'test channel 2'},
                ]}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<Async
  cacheOptions={false}
  className="ChannelsInput"
  classNamePrefix="channels-input"
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
  loadOptions={[Function]}
  loadingMessage={[Function]}
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
        "display_name": "test channel 1",
        "id": "test-channel-1",
        "type": "O",
      },
      Object {
        "display_name": "test channel 2",
        "id": "test-channel-2",
        "type": "P",
      },
    ]
  }
/>
`);
    });
});
