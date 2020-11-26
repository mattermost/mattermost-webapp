import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Button, { ButtonProps } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
} as Meta;

export const Default: Story<ButtonProps> = (args) => <Button {...args} />;
Default.args = {
  label: 'Default Button',
};
