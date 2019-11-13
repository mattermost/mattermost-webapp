// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MenuWrapper from './menu_wrapper';

describe('components/MenuWrapper', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <MenuWrapper>
                <p>{'title'}</p>
                <p>{'menu'}</p>
            </MenuWrapper>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="MenuWrapper "
  onClick={[Function]}
>
  <p>
    title
  </p>
  <MenuWrapperAnimation
    show={false}
  >
    <p>
      menu
    </p>
  </MenuWrapperAnimation>
</div>
`);
    });

    test('should match snapshot with state false', () => {
        const wrapper = shallow(
            <MenuWrapper>
                <p>{'title'}</p>
                <p>{'menu'}</p>
            </MenuWrapper>
        );
        wrapper.setState({open: true});
        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="MenuWrapper "
  onClick={[Function]}
>
  <p>
    title
  </p>
  <MenuWrapperAnimation
    show={true}
  >
    <p>
      menu
    </p>
  </MenuWrapperAnimation>
</div>
`);
    });

    test('should toggle the state on click', () => {
        const wrapper = shallow(
            <MenuWrapper>
                <p>{'title'}</p>
                <p>{'menu'}</p>
            </MenuWrapper>
        );
        expect(wrapper.state('open')).toBe(false);
        wrapper.simulate('click');
        expect(wrapper.state('open')).toBe(true);
        wrapper.simulate('click');
        expect(wrapper.state('open')).toBe(false);
    });

    test('should raise an exception on more or less than 2 children', () => {
        expect(() => {
            shallow(<MenuWrapper/>);
        }).toThrow();
        expect(() => {
            shallow(
                <MenuWrapper>
                    <p>{'title'}</p>
                </MenuWrapper>
            );
        }).toThrow();
        expect(() => {
            shallow(
                <MenuWrapper>
                    <p>{'title1'}</p>
                    <p>{'title2'}</p>
                    <p>{'title3'}</p>
                </MenuWrapper>
            );
        }).toThrow();
    });
});
