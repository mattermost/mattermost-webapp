// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import BotBadge from './bot_badge.jsx';

describe('components/widgets/badges/BotBadge', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <BotBadge className={'test'}/>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="bot-badge__container"
>
  <Badge
    className="bot-badge test"
    show={true}
  >
    <FormattedMessage
      defaultMessage="BOT"
      id="post_info.bot"
      values={Object {}}
    />
  </Badge>
</div>
`);
    });
});
