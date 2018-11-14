// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import AutocompleteSelector from './autocomplete_selector';

describe('components/widgets/settings/AutocompleteSelector', () => {
    test('render component with required props', () => {
        const wrapper = shallow(
            <AutocompleteSelector
                id='string.id'
                label='some label'
                value='some value'
                providers={[]}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="form-group"
>
  <label
    className="control-label "
  >
    some label
  </label>
  <div
    className=""
  >
    <SuggestionBox
      className="form-control"
      completeOnTab={true}
      containerClass="select-suggestion-container"
      isRHS={false}
      listComponent={[Function]}
      listStyle="top"
      onBlur={[Function]}
      onChange={[Function]}
      onFocus={[Function]}
      onItemSelected={[Function]}
      openOnFocus={true}
      openWhenEmpty={true}
      providers={Array []}
      renderDividers={false}
      renderNoResults={true}
      replaceAllInputOnSelect={true}
      requiredCharacters={1}
      value="some value"
    />
  </div>
</div>
`);
    });

    test('check state with selected prop', () => {
        const selected = {text: 'text', value: 'value'};
        const wrapper = shallow(
            <AutocompleteSelector
                id='string.id'
                providers={[]}
                label='some label'
                selected={selected}
            />
        );

        expect(wrapper.state()).toEqual({input: selected.text, selected});
    });

    test('onChange', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <AutocompleteSelector
                id='string.id'
                label='some label'
                value='some value'
                providers={[]}
                onChange={onChange}
            />
        );

        wrapper.instance().onChange({target: {value: 'somenewvalue'}});

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('string.id', 'somenewvalue');
    });
});
