// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CloseIcon from 'components/widgets/icons/close_icon';

import FullScreenModal from './full_screen_modal.jsx';

describe('components/widgets/modals/FullScreenModal', () => {
    test('showing content', () => {
        const wrapper = shallow(
            <FullScreenModal
                show={true}
                onClose={jest.fn()}
            >
                {'test'}
            </FullScreenModal>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<CSSTransition
  appear={true}
  classNames="FullScreenModal"
  in={true}
  mountOnEnter={true}
  timeout={100}
  unmountOnExit={true}
>
  <div
    className="FullScreenModal"
  >
    <CloseIcon
      className="close-x"
      onClick={[Function]}
    />
    test
  </div>
</CSSTransition>
`);
    });
    test('not showing content', () => {
        const wrapper = shallow(
            <FullScreenModal
                show={false}
                onClose={jest.fn()}
            >
                {'test'}
            </FullScreenModal>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<CSSTransition
  appear={true}
  classNames="FullScreenModal"
  in={false}
  mountOnEnter={true}
  timeout={100}
  unmountOnExit={true}
>
  <div
    className="FullScreenModal"
  >
    <CloseIcon
      className="close-x"
      onClick={[Function]}
    />
    test
  </div>
</CSSTransition>
`);
    });
    test('close on close icon click', () => {
        const close = jest.fn();
        const wrapper = shallow(
            <FullScreenModal
                show={true}
                onClose={close}
            >
                {'test'}
            </FullScreenModal>
        );
        expect(close).not.toBeCalled();
        wrapper.find(CloseIcon).simulate('click');
        expect(close).toBeCalled();
    });

    test('close on esc keypress', () => {
        const close = jest.fn();
        shallow(
            <FullScreenModal
                show={true}
                onClose={close}
            >
                {'test'}
            </FullScreenModal>
        );
        expect(close).not.toBeCalled();
        const event = new KeyboardEvent('keydown', {key: 'Escape'});
        document.dispatchEvent(event);
        expect(close).toBeCalled();
    });
});
