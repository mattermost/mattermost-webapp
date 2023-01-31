// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';

import {AppCallResponse} from '@mattermost/types/apps';

import mockStore from 'tests/test_store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {GlobalState} from 'types/store';
import {Channel} from '@mattermost/types/channels';
import {generateIdsForAppBinding} from 'actions/views/rhs';

import {AppsView} from './apps_view';

const testData = {
    type: 'view',
    location: 'document-list',

    // type: 'ok',
    // data:
    // {
    bindings: [
        {
            bindings: [
                {
                    bindings: [
                        {
                            bindings: [
                                {
                                    bindings: [
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Open',
                                            submit: {
                                                path: '/actions/open-file',
                                                state: {
                                                    document_id: 'shared_doc_1',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Share',
                                            submit: {
                                                path: '/actions/share-file',
                                                state: {
                                                    document_id: 'shared_doc_1',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            form: {
                                                fields: [
                                                    {
                                                        description: 'File My Shared Document - designs',
                                                        name: 'markdown',
                                                        type: 'markdown',
                                                    },
                                                    {
                                                        name: 'submit_buttons',
                                                        options: [
                                                            {
                                                                label: 'Confirm',
                                                                value: 'confirm',
                                                            },
                                                        ],
                                                        type: 'static_select',
                                                    },
                                                ],
                                                submit: {
                                                    path: '/actions/delete-file',
                                                    state: {
                                                        document_id: 'shared_doc_1',
                                                    },
                                                },
                                                submit_buttons: 'submit_buttons',
                                                title: 'Confirm File Delete',
                                            },
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Delete',
                                            type: '',
                                        },
                                    ],
                                    location: 'actions',
                                    type: 'actions',
                                },
                            ],
                            description: '4:30 PM · Opened by me',
                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                            label: 'My Shared Document - designs',
                            location: 'shared_doc_1',
                            submit: {
                                path: '/actions/open-file',
                                state: {
                                    document_id: 'shared_doc_1',
                                },
                            },
                            type: 'list_item',
                        },
                        {
                            bindings: [
                                {
                                    bindings: [
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Open',
                                            submit: {
                                                path: '/actions/open-file',
                                                state: {
                                                    document_id: 'shared_doc_2',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Share',
                                            submit: {
                                                path: '/actions/share-file',
                                                state: {
                                                    document_id: 'shared_doc_2',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            form: {
                                                fields: [
                                                    {
                                                        description: 'File My Second Shared Document',
                                                        name: 'markdown',
                                                        type: 'markdown',
                                                    },
                                                    {
                                                        name: 'submit_buttons',
                                                        options: [
                                                            {
                                                                label: 'Confirm',
                                                                value: 'confirm',
                                                            },
                                                        ],
                                                        type: 'static_select',
                                                    },
                                                ],
                                                submit: {
                                                    path: '/actions/delete-file',
                                                    state: {
                                                        document_id: 'shared_doc_2',
                                                    },
                                                },
                                                submit_buttons: 'submit_buttons',
                                                title: 'Confirm File Delete',
                                            },
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Delete',
                                            type: '',
                                        },
                                    ],
                                    location: 'actions',
                                    type: 'actions',
                                },
                            ],
                            description: '4:30 PM · Opened by me',
                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                            label: 'My Second Shared Document',
                            location: 'shared_doc_2',
                            submit: {
                                path: '/actions/open-file',
                                state: {
                                    document_id: 'shared_doc_2',
                                },
                            },
                            type: 'list_item',
                        },
                    ],
                    location: 'document_list_block',
                    type: 'list_block',
                },
            ],
            location: 'document-list',
            source: {
                expand: {
                    channel: 'summary',
                },
                path: '/views/home/refresh/document-list',
                state: {
                    drive_id: 'shared_with_me',
                },
            },
            type: 'view',
        },
    ],

    // },
    // app_metadata: {
    //     bot_user_id: 'b6hbmpd1oinyib5toc3gpjbcae',
    //     bot_username: 'hello-world-app-bar',
    // },
};

const listBlockData = {
    bindings: [
        {
            bindings: [
                {
                    bindings: [
                        {
                            bindings: [
                                {
                                    bindings: [
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Open',
                                            submit: {
                                                path: '/actions/open-file',
                                                state: {
                                                    document_id: 'my_doc_1',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Share',
                                            submit: {
                                                path: '/actions/share-file',
                                                state: {
                                                    document_id: 'my_doc_1',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            form: {
                                                fields: [
                                                    {
                                                        description: 'File My Document - designs',
                                                        name: 'markdown',
                                                        type: 'markdown',
                                                    },
                                                    {
                                                        name: 'submit_buttons',
                                                        options: [
                                                            {
                                                                label: 'Confirm',
                                                                value: 'confirm',
                                                            },
                                                        ],
                                                        type: 'static_select',
                                                    },
                                                ],
                                                submit: {
                                                    path: '/actions/delete-file',
                                                    state: {
                                                        document_id: 'my_doc_1',
                                                    },
                                                },
                                                submit_buttons: 'submit_buttons',
                                                title: 'Confirm File Delete',
                                            },
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Delete',
                                            type: '',
                                        },
                                    ],
                                    location: 'actions',
                                    type: 'actions',
                                },
                            ],
                            description: '4:30 PM · Opened by me',
                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                            label: 'My Document - designs',
                            location: 'my_doc_1',
                            submit: {
                                path: '/actions/open-file',
                                state: {
                                    document_id: 'my_doc_1',
                                },
                            },
                            type: 'list_item',
                        },
                        {
                            bindings: [
                                {
                                    bindings: [
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Open',
                                            submit: {
                                                path: '/actions/open-file',
                                                state: {
                                                    document_id: 'my_doc_2',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Share',
                                            submit: {
                                                path: '/actions/share-file',
                                                state: {
                                                    document_id: 'my_doc_2',
                                                },
                                            },
                                            type: 'action',
                                        },
                                        {
                                            form: {
                                                fields: [
                                                    {
                                                        description: 'File My Second Document',
                                                        name: 'markdown',
                                                        type: 'markdown',
                                                    },
                                                    {
                                                        name: 'submit_buttons',
                                                        options: [
                                                            {
                                                                label: 'Confirm',
                                                                value: 'confirm',
                                                            },
                                                        ],
                                                        type: 'static_select',
                                                    },
                                                ],
                                                submit: {
                                                    path: '/actions/delete-file',
                                                    state: {
                                                        document_id: 'my_doc_2',
                                                    },
                                                },
                                                submit_buttons: 'submit_buttons',
                                                title: 'Confirm File Delete',
                                            },
                                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                                            label: 'Delete',
                                            type: '',
                                        },
                                    ],
                                    location: 'actions',
                                    type: 'actions',
                                },
                            ],
                            description: '4:30 PM · Opened by me',
                            icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
                            label: 'My Second Document',
                            location: 'my_doc_2',
                            submit: {
                                path: '/actions/open-file',
                                state: {
                                    document_id: 'my_doc_2',
                                },
                            },
                            type: 'list_item',
                        },
                    ],
                    location: 'document_list_block',
                    type: 'list_block',
                },
            ],
            location: 'document-list',
            source: {
                expand: {
                    channel: 'summary',
                },
                path: '/views/home/refresh/document-list',
                state: {
                    drive_id: 'my_drive',
                },
            },
            type: 'view',
        },
    ],
    location: 'document-list',
    type: 'view',
};

describe('AppsView/ListBlock', () => {
    it('should render sample view', async () => {
        const binding = generateIdsForAppBinding(testData, 'test-app');

        const callResponse: AppCallResponse = {
            type: 'view',
            data: listBlockData,
        };
        const handleBindingClick = jest.fn().mockResolvedValue({error: null, data: callResponse});

        const props: React.ComponentProps<typeof AppsView> = {
            location: 'rhs',
            tree: binding,
            setTree: jest.fn(),
            handleBindingClick,
        };

        const store = await mockStore({
            entities: {
                channels: {
                    channels: {
                        test: {
                            id: 'test',
                        } as Channel,
                    },
                    currentChannelId: 'test',
                },
            },
        } as GlobalState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <AppsView {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
