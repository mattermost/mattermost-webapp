// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import TextSetting from './text_setting';

describe('components/widgets/settings/TextSetting', () => {
    test('render component with required props', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <TextSetting
                id='string.id'
                label='some label'
                value='some value'
                onChange={onChange}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<Setting
  inputClassName=""
  inputId="string.id"
  label="some label"
  labelClassName=""
>
  <input
    className="form-control"
    id="string.id"
    maxLength={null}
    onChange={[Function]}
    type="input"
    value="some value"
  />
</Setting>
`);
    });

    test('render with textarea type', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <TextSetting
                id='string.id'
                label='some label'
                value='some value'
                type='textarea'
                onChange={onChange}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<Setting
  inputClassName=""
  inputId="string.id"
  label="some label"
  labelClassName=""
>
  <textarea
    className="form-control"
    id="string.id"
    maxLength={null}
    onChange={[Function]}
    rows="5"
    style={Object {}}
    value="some value"
  />
</Setting>
`);
    });

    // This test is disabled as TSC will not allow to pass any other value to `type`
/*
    test('render with bad type', () => {
        const originalError = console.error;
        console.error = jest.fn();

        const wrapper = shallow(
            <TextSetting
                id='string.id'
                label='some label'
                value='some value'
                type='junk'
            />
        );

        expect(console.error).toBeCalledTimes(1);

        console.error = originalError;

        expect(wrapper).toMatchInlineSnapshot(`
<Setting
  inputClassName=""
  inputId="string.id"
  label="some label"
  labelClassName=""
>
  <input
    className="form-control"
    id="string.id"
    maxLength={null}
    onChange={[Function]}
    type="input"
    value="some value"
  />
</Setting>
`);
    });
*/

    test('onChange', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <TextSetting
                id='string.id'
                label='some label'
                value='some value'
                onChange={onChange}
            />
        );

        wrapper.find('input').simulate('change', {target: {value: 'somenewvalue'}});

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('string.id', 'somenewvalue');
    });
});
