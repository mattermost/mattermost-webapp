// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import createEngine, {DiagramModel, DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';
import {CanvasWidget} from '@projectstorm/react-canvas-core';

import SystemBusCanvasWidget from './systembus_canvas_widget';
import {MattermostLinkFactory, MattermostLinkModel} from './customlink';
import Toolbox from './toolbox';

export type CanvasGraphType = {
    id: string;
    nodes: DefaultNodeModel[];
    links: MattermostLinkModel[];
    name: string;
    original: GraphType;
}

export type SubCommand = {
    subCommand: string;
    description: string;
    hint: string;
    name: string;
    flags: {[key: string]: string};
}

export type Command = {
    command: string;
    description: string;
    hint: string;
    name: string;
    subCommands: SubCommand[];
    flags: {[key: string]: string};
}

export type GraphNode = {
    actionName?: string;
    command?: Command;
    eventName?: string;
    id: string;
    inputs: string[];
    outputs: string[];
    secret?: string;
    type: string;
    controlType?: string;
    ifValue?: string;
    ifComparison?: string;
    caseValues?: string[];
    randomOptions?: number;
    x: number;
    y: number;
}

export type GraphEdge = {
    config: Record<string, string>;
    from: string;
    fromOutput: string;
    id: string;
    to: string;
}
export type GraphType = {
    id: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    name: string;
}

type Props = {
    data: CanvasGraphType;
    actions: any[];
    events: any[];
    onSave: (data: any) => void;
    onCancel: () => void;
}

export const Graph = ({data, onSave, onCancel, actions, events}: Props) => {
    const [forceUpdate, setForceUpdate] = useState<number>(0);
    const engine = useRef<DiagramEngine>();
    useEffect(() => {
        if (!engine.current) {
            engine.current = createEngine();
            engine.current.getLinkFactories().registerFactory(new MattermostLinkFactory());
        }

        //2) setup the diagram model
        const model = new DiagramModel();

        //4) add the models to the root graph
        const models = model.addAll(...data.nodes, ...data.links);

        //5) load model into engine
        engine.current.setModel(model);

        // add a selection listener to each
        models.forEach((item) => {
            item.registerListener({
                eventDidFire: (e: any) => console.log(e),
            });
        });

        model.registerListener({
            eventDidFire: (e: any) => console.log(e),
        });
    }, [data]);

    if (!engine.current) {
        return null;
    }

    //6) render the diagram!
    const canvas = data ? <CanvasWidget engine={engine.current}/> : undefined;

    return (
        <SystemBusCanvasWidget
            engine={engine.current}
            forceUpdate={() => setForceUpdate(forceUpdate+1)}
        >
            <h1 className='graph-title'>{data.name}</h1>
            {canvas}
            <Toolbox
                actions={actions}
                events={events}
            />
            <div className='graph-btn-ctr'>
                <button
                    className='btn btn-secondary systembus__btn'
                    onClick={onCancel}
                >
                    <FormattedMessage
                        id='admin.systembus.cancel-graph-button'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    className='btn btn-primary systembus__btn'
                    onClick={() => onSave(engine.current?.getModel().serialize())}
                >
                    <FormattedMessage
                        id='admin.systembus.save-graph-button'
                        defaultMessage='Save'
                    />
                </button>
            </div>
        </SystemBusCanvasWidget>
    );
};

export default Graph;
