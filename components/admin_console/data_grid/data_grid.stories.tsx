// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import DataGrid, {Column, Row} from 'components/admin_console/data_grid/data_grid';

const columns: Column[] = [
    {
        name: (
            <FormattedMessage
                id='admin.data_retention.customPoliciesTable.description'
                defaultMessage='Description'
            />
        ),
        field: 'description',
    },
    {
        name: (
            <FormattedMessage
                id='admin.data_retention.customPoliciesTable.channelMessages'
                defaultMessage='Channel messages'
            />
        ),
        field: 'channel_messages',
    },
    {
        name: (
            <FormattedMessage
                id='admin.data_retention.customPoliciesTable.appliedTo'
                defaultMessage='Applied to'
            />
        ),
        field: 'applied_to',
    },
    {
        name: '',
        field: 'actions',
        className: 'actionIcon',
    },
];
const data = [
    {
        description: '60 day policy',
        channel_messages: '60 days',
        applied_to: '2 teams, 4 channels',
    },
    {
        description: 'Yearly policy',
        channel_messages: '1 year',
        applied_to: '17 teams',
    },
    {
        description: '60 day policy',
        channel_messages: '60 days',
        applied_to: '2 teams, 4 channels',
    },
    {
        description: 'Yearly policy',
        channel_messages: '1 year',
        applied_to: '17 teams',
    },
];

const dataNextPage = [
    {
        description: '60 day policy Next Page',
        channel_messages: '60 days',
        applied_to: '2 teams, 4 channels',
    },
    {
        description: 'Yearly policy',
        channel_messages: '1 year',
        applied_to: '140 teams',
    },
    {
        description: '60 day policy',
        channel_messages: '60 days',
        applied_to: '2 teams, 4 channels',
    },
    {
        description: 'Yearly policy',
        channel_messages: '1 year',
        applied_to: '17 teams',
    },
];
const getRows = (entries: any): Row[] => {
    return entries.map((policy: any) => {
        return {
            cells: {
                description: policy.description,
                channel_messages: policy.channel_messages,
                applied_to: policy.applied_to,
                actions: (
                    <MenuWrapper
                        isDisabled={false}
                    >
                        <div className='text-right'>
                            <a>
                                <i className='icon icon-dots-vertical'/>
                            </a>
                        </div>
                        <Menu
                            openLeft={true}
                            openUp={false}
                            ariaLabel={'User Actions Menu'}
                        >
                            <Menu.ItemAction
                                show={true}
                                onClick={() => {}}
                                text={'Edit'}
                                disabled={false}
                            />
                            <Menu.ItemAction
                                show={true}
                                onClick={() => {}}
                                text={'Delete'}
                                disabled={false}
                            />
                        </Menu>
                    </MenuWrapper>
                ),
            },
        };
    });
};

storiesOf('Admin Console/Data Grid', module).
    addDecorator(withKnobs).
    add(
        'Custom Data Grid - No pagination',
        () => {
            const WrapperComponent = () => {
                return (
                    <DataGrid
                        columns={columns}
                        rows={getRows(data)}
                        loading={false}
                        page={0}
                        nextPage={() => {}}
                        previousPage={() => {}}
                        startCount={1}
                        endCount={4}
                        total={0}
                        className={'customTable'}
                    />
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'Custom Data Grid - Pagination',
        () => {
            const WrapperComponent = () => {
                const MAX_PER_PAGE = 4;

                const [page, setPage] = useState(0);
                const [tableRows, setRows] = useState(getRows(data));

                return (
                    <DataGrid
                        columns={columns}
                        rows={tableRows}
                        loading={false}
                        page={page}
                        nextPage={() => {
                            setPage(page + 1);

                            // Here you would fetch more records using pagination
                            setRows(getRows(dataNextPage));
                        }}
                        previousPage={() => {
                            setPage(page - 1);

                            // Here you would fetch previous records using pagination
                            setRows(getRows(data));
                        }}
                        startCount={(page * MAX_PER_PAGE) + 1}
                        endCount={(page + 1) * MAX_PER_PAGE}
                        total={8}
                        className={'customTable'}
                    />
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    );
