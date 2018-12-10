// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Group from './group';

describe('components/ChannelHeaderDropdown/MenuItem.Group', () => {
    it('should render divider with valid child', () => {
        const wrapper = shallow(
            <Group>
                {[<React.Fragment key={1}>{'Something'}</React.Fragment>]}
            </Group>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<Fragment>
  Something
  <li
    className="divider"
  />
</Fragment>
`);
    });

    it('should not render a divider if the children are empty', () => {
        const wrapper = shallow(<Group>{[null, null, null]}</Group>);
        expect(wrapper).toMatchInlineSnapshot('<Fragment />');
    });

    it('should not render a divider if the children contain empty children', () => {
        const wrapper = shallow(
            <Group>
                {[null, <React.Fragment key={1}>{null}</React.Fragment>, null]}
            </Group>
        );
        expect(wrapper).toMatchInlineSnapshot('<Fragment />');
    });

    it('should render a divider if some children are non-null', () => {
        const wrapper = shallow(
            <Group>
                {[
                    null,
                    <React.Fragment key={1}>{null}</React.Fragment>,
                    <React.Fragment key={1}>{'data'}</React.Fragment>,
                ]}
            </Group>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<Fragment>
  data
  <li
    className="divider"
  />
</Fragment>
`);
    });
});
