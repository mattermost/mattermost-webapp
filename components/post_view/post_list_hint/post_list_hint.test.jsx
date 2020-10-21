import React from 'react';
import {shallow} from 'enzyme';
import { PostListHint } from 'components/post_view/post_list_hint';
import { mountWithIntl } from 'tests/helpers/intl-test-helper';

describe('components/PostListHint', () => {
  const defaultProps = {
    show: true,
    onDismiss: jest.fn(),
  };

  it('should match snapshot when tooltip is visible', () => {
    const wrapper = shallow(<PostListHint {...defaultProps}><b>Hint: you can dismiss this message</b></PostListHint>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should match snapshot when tooltip is hidden', () => {
    const wrapper = shallow(<PostListHint {...{...defaultProps, show: false}}><b>Hint: you can dismiss this message</b></PostListHint>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should fire dismissHandler when dismiss button is clicked', () => {
    const dismissHandler = jest.fn();
    const wrapper = mountWithIntl(<PostListHint {...{...defaultProps, onDismiss: dismissHandler}}><b>Hint: you can dismiss this message</b></PostListHint>);
    const dismissButton = wrapper.find('.toast__dismiss');

    dismissButton.simulate('click');

    expect(dismissHandler).toBeCalled();
  });
});