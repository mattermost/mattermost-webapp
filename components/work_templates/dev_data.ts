// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Visibility, WorkTemplate} from '@mattermost/types/work_templates';

export const worktemplates: WorkTemplate[] = [
    {
        id: 'product+product_roadmap',
        category: {id: 'product_team', name: 'Product Team'},
        useCase: 'Feature Release',
        visibility: Visibility.Public,
        illustration: 'https://via.placeholder.com/204x123.png',
        description: {
            channel: {
                message: 'This is the channels section description',
            },
            board: {
                message: 'This is the boards section description',
            },
            playbook: {
                message: 'This is the playbooks section description',
            },
            integration: {
                message: 'Increase productivity in your channel by integrating a Jira bot and Github bot.',
                illustration: 'https://via.placeholder.com/509x352.png?text=Integrations',

            },
        },
        content: [
            {
                channel: {
                    id: 'channel_id_1',
                    name: 'Feature release',
                    illustration: 'https://via.placeholder.com/509x352.png?text=Channel+feature+release',
                },
            },
            {
                board: {
                    id: 'board_id_1',
                    name: 'Meeting Agenda',
                    illustration: 'https://via.placeholder.com/509x352.png?text=Board+meeting+agenda',

                },
            },
            {
                board: {
                    id: 'board_id_2',
                    name: 'Project Task',
                    illustration: 'https://via.placeholder.com/509x352.png?text=Board+project+task',
                },
            },
            {
                playbook: {
                    id: 'playbook_id_1',
                    name: 'Feature release',
                    illustration: 'https://via.placeholder.com/509x352.png?text=Playbook+feature+release',
                },
            },
            {
                integration: {
                    id: 'github',
                },
            },
            {
                integration: {
                    id: 'jira',
                },
            },
            {
                integration: {
                    id: 'com.github.mattermost.plugin-circleci',
                },
            },
            {
                integration: {
                    id: 'com.mattermost.confluence',
                },
            },
            {
                integration: {
                    id: 'jenkins',
                },
            },
        ],
    },
];
