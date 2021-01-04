// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import { shallow } from 'enzyme';

import { HintToast } from './hint_toast';

describe('components/HintToast', () => {
  test('should match snapshot for regular width', () => {
    const wrapper = shallow(<HintToast width={1200} onDismiss={jest.fn()}>A hint</HintToast>);
    expect(wrapper).toMatchSnapshot();
  });

  test('should match snapshot for full width', () => {
    const wrapper = shallow(<HintToast width={400} onDismiss={jest.fn()}>A hint</HintToast>);
    expect(wrapper).toMatchSnapshot();
  });

  test('should fire onDismiss callback', () => {
    const dismissHandler = jest.fn();
    const wrapper = shallow(<HintToast width={1200} onDismiss={dismissHandler}>A hint</HintToast>);

    wrapper.find('.hint-toast__dismiss').simulate('click');
    
    expect(dismissHandler).toHaveBeenCalled();
  });
});
