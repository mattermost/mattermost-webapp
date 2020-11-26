import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Icon, { IconProps } from './Icon';

export default {
  title: 'Foundations/Icon',
  component: Icon,
} as Meta;


export const Default: Story<IconProps> = (args) => <Icon {...args} />;
Default.args = {
  glyph: 'icon-emoticon-happy-outline'
};
