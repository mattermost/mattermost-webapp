// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ReactWrapper} from 'enzyme';
import {Client4} from 'mattermost-redux/client';

import {act} from 'react-dom/test-utils';

import {StatusOK} from 'mattermost-redux/types/client4';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import NotifyLink, {DafaultBtnText} from './notify_link';

const actImmediate = (wrapper: ReactWrapper) =>
    act(
        () =>
            new Promise<void>((resolve) => {
                setImmediate(() => {
                    wrapper.update();
                    resolve();
                });
            }),
    );

describe('components/widgets/links/NotifyLink', () => {
    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <NotifyLink/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should attempt to send and fail', async () => {
        const wrapper = mountWithIntl(
            <NotifyLink/>,
        );

        const btn = wrapper.find('button');
        expect(btn.text()).toEqual(DafaultBtnText.NotifyAdmin);
        btn.simulate('click');
        expect(btn.text()).toEqual(DafaultBtnText.Sending);

        // wait for the promise called in the try anc catch block to resolve before updating the button text
        await actImmediate(wrapper);

        // ultimately fails because the request errors
        expect(btn.text()).toEqual(DafaultBtnText.Failed);
    });

    test('should attempt to send and succeed', async () => {
        const promise = new Promise<StatusOK>(function(resolve) {
            resolve({
                status: 'OK',
            });
        });
        const upgradeRequestMock = jest.spyOn(Client4, 'sendAdminUpgradeRequestEmail');
        upgradeRequestMock.mockImplementation(() => promise);

        const wrapper = mountWithIntl(
            <NotifyLink/>,
        );

        const btn = wrapper.find('button');
        expect(btn.text()).toEqual(DafaultBtnText.NotifyAdmin);
        btn.simulate('click');
        expect(btn.text()).toEqual(DafaultBtnText.Sending);

        // wait for the promise called in the try anc catch block to resolve before updating the button text
        await actImmediate(wrapper);

        expect(btn.text()).toEqual(DafaultBtnText.Sent);
        upgradeRequestMock.mockRestore();
    });
});
