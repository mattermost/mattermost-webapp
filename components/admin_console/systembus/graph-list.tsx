// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

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
                        {graph.name}
                        <div className='systembus__graphs-list-item__button-ctr'>
                            <button
                                className='btn btn-primary'
                                onClick={() => editGraph(graph.id)}
                            >
                                <FormattedMessage
                                    id='admin.systembus.edit-graph-button'
                                    defaultMessage='Edit'
                                />
                            </button>
                            <button
                                className='btn btn-default'
                                onClick={() => deleteGraph(graph.id)}
                            >
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
                    className='btn btn-primary'
                    onClick={() => addGraph()}
                >
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
