// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {
    PencilOutlineIcon,
    PlusIcon, TrashCanOutlineIcon,
} from '@mattermost/compass-icons/components';

import {GraphType} from './graph';
type Props = {
    graphs: GraphType[];
    editGraph: (id: string) => void;
    deleteGraph: (id: string) => void;
    addGraph: () => void;
}
const GraphList = ({graphs, editGraph, deleteGraph, addGraph}: Props) => {
    return (
        <div className='systembus__graphs-list-ctr'>
            <div className='systembus__graphs-list'>
                {graphs.map((graph: any) => (
                    <div
                        key={graph.id}
                        className='systembus__graphs-list-item'
                    >
                        <span className='systembus__graphs-list-item__label'>{graph.name}</span>
                        <div className='systembus__graphs-list-item__button-ctr'>
                            <button
                                className='btn btn-primary systembus__btn'
                                onClick={() => editGraph(graph.id)}
                            >
                                <PencilOutlineIcon
                                    size={16}
                                    color={'var(--center-channel-bg)'}
                                />
                                <FormattedMessage
                                    id='admin.systembus.edit-graph-button'
                                    defaultMessage='Edit'
                                />
                            </button>
                            <button
                                className='btn btn-default systembus__btn'
                                onClick={() => deleteGraph(graph.id)}
                            >
                                <TrashCanOutlineIcon
                                    size={16}
                                    color={'var(--center-channel-bg)'}
                                />
                                <FormattedMessage
                                    id='admin.systembus.delete-graph-button'
                                    defaultMessage='Delete'
                                />
                            </button>
                        </div>
                    </div>))}
            </div>
            <div className='systembus__add-ctr'>
                <button
                    className='btn btn-primary systembus__btn'
                    onClick={() => addGraph()}
                >
                    <PlusIcon
                        size={16}
                        color={'var(--center-channel-bg)'}
                    />
                    <FormattedMessage
                        id='admin.systembus.add-graph-button'
                        defaultMessage='Add graph'
                    />
                </button>
            </div>
        </div>
    );
};

export default GraphList;
