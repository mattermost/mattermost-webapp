import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import IconButton, { IconButtonProps } from './IconButton';

export default {
  title: 'Components/IconButton',
  component: IconButton,
} as Meta;


export const Default: Story<IconButtonProps> = (args) => <IconButton {...args} />;
Default.args = {
};
