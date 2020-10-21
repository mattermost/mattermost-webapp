import React from 'react';
import {shallow} from 'enzyme';
import { ShortcutKey, ShortcutKetVariant } from './shortcut_key';

describe('components/ShortcutKey', () => {
  test('should match snapshot for regular key', () => {
    const wrapper = shallow(<ShortcutKey>Shift</ShortcutKey>);
    expect(wrapper).toMatchSnapshot();
  });

  test('should match snapshot for contrast key', () => {
    const wrapper = shallow(<ShortcutKey variant={ShortcutKetVariant.contrast}>Shift</ShortcutKey>);
    expect(wrapper).toMatchSnapshot();
  });
});