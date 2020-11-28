import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Button, { ButtonProps } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
} as Meta;

export const Default: Story<ButtonProps> = (args) => {
  return (
    <>
      <Button {...args} />
      <Button {...args} iconGlyph="icon-alien-outline" />
      <Button {...args} iconGlyph="icon-alien-outline" iconPosition="trailing" />
    </>
  )
};
Default.args = {
  label: 'Default Button',
};
