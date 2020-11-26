import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Text, { TextProps } from './Text';

interface StoryTextProps extends TextProps {
  label: string,
}

export default {
  title: 'Foundations/Text',
  component: Text,
  argTypes: {
    label: {
      control: {
        type: 'text',
      }
    },
  }
} as Meta;

const Template: Story<StoryTextProps> = ({label = 'Default text', ...args}) => <Text {...args}>{label}</Text>;

export const Default = Template.bind({});
Default.args = {
  size: 'medium',
};
