// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';

import {AppBinding} from '@mattermost/types/apps';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import {AppsView, AppsViewProps} from '../apps_view';

import {testGoogleDriveView} from './testdata';

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'channel1',
            channels: {
                channel1: {
                    id: 'channel1',
                    team_id: 'team_id1',
                    name: 'channel1',
                },
            },
            myMembers: {},
        },
    },
};

describe('apps_view/AppsView', () => {
    let tree: AppBinding = {
        type: 'view',
        app_id: 'test',
        label: '',
        bindings: [
            {
                location: 'list_block',
                type: 'list_block',
                label: '',
                bindings: [
                    {
                        location: 'file-1',
                        label: 'Document 1',
                        submit: {
                            path: '/actions/open-file?id=1',
                        },
                    },
                    {
                        location: 'file-2',
                        label: 'Document 2',
                    },
                ],
            },
        ],
    };

    tree = testGoogleDriveView;

    const baseProps: AppsViewProps = {
        location: 'test',
        tree,
        setTree: jest.fn(),
    };

    const hasLocation = (x: AppBinding): boolean => {
        if (!x.location) {
            console.log('no location: ' + JSON.stringify(x));
            return false;
        }

        if (!x.bindings) {
            return true;
        }

        return x.bindings.reduce((accum, current) => accum && hasLocation(current), true);
    };

    hasLocation(tree);

    test('should match snapshot', async () => {
        const store = await mockStore(initialState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <AppsView
                    {...baseProps}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
