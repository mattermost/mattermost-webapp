// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {mount} from 'enzyme';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import CloseCircleIcon from 'components/widgets/icons/close_circle_icon';

import AddToChannels, {Props} from './add_to_channels';

type WithIntlProps = {
    children: React.ReactNode | React.ReactNodeArray;
};
const WithIntl = (props: WithIntlProps) => {
    return (
        <IntlProvider
            locale='en'
            messages={{}}
        >
            {props.children}
        </IntlProvider>
    );
};

const defaultProps: Props = deepFreeze({
    customMessage: {
        message: '',
        open: false,
    },
    toggleCustomMessage: jest.fn(),
    setCustomMessage: jest.fn(),
    inviteChannels: {
        channels: [],
        search: '',
    },
    onChannelsChange: jest.fn(),
    onChannelsInputChange: jest.fn(),
    channelsLoader: jest.fn(),
    currentChannelName: '',
});

let props = defaultProps;

describe('AddToChannels', () => {
    beforeEach(() => {
        props = defaultProps;
    });
    describe('custom message', () => {
        it('UI to toggle custom message opens it when closed', () => {
            const wrapper = mount(<WithIntl><AddToChannels {...props}/></WithIntl>);
            expect(props.toggleCustomMessage).not.toHaveBeenCalled();
            wrapper.find('a').at(0).simulate('click');
            expect(props.toggleCustomMessage).toHaveBeenCalled();
        });

        it('UI to toggle custom message closes it when opened', () => {
            props = {
                ...props,
                customMessage: {
                    ...props.customMessage,
                    open: true,
                },
            };
            const wrapper = mount(<WithIntl><AddToChannels {...props}/></WithIntl>);
            expect(props.toggleCustomMessage).not.toHaveBeenCalled();
            wrapper.find(CloseCircleIcon).at(0).simulate('click');
            expect(props.toggleCustomMessage).toHaveBeenCalled();
        });

        it('UI to write custom message calls the on change handler with its input', () => {
            props = {
                ...props,
                customMessage: {
                    ...props.customMessage,
                    open: true,
                },
            };
            const wrapper = mount(<WithIntl><AddToChannels {...props}/></WithIntl>);
            expect(props.setCustomMessage).not.toHaveBeenCalled();
            const expectedMessage = 'welcome to the team!';
            wrapper.find('textarea').at(0).simulate('change', {
                target: {
                    value: expectedMessage,
                },
            });
            expect(props.setCustomMessage).toHaveBeenCalledWith(expectedMessage);
        });
    });
});
