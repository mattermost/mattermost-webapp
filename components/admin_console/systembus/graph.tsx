// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import createEngine, {DiagramModel, DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';
import {CanvasWidget} from '@projectstorm/react-canvas-core';

import SystemBusCanvasWidget from './systembus_canvas_widget';
import {MattermostLinkFactory, MattermostLinkModel} from './customlink';

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
    onSave: (data: any) => void;
}

export const Graph = ({data, onSave}: Props) => {
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
        <SystemBusCanvasWidget engine={engine.current}>
            <h1 className='graph-title'>{data.name}</h1>
            {canvas}
            <div className='graph-toolbox'>
                <ToolboxNodeItem
                    name='test'
                    model={{
                        name: 'event',
                        color: 'rgb(255,0,128)',
                    }}
                />
            </div>
            <button
                className='btn btn-primary save-graph-button'
                onClick={() => onSave(engine.current?.getModel().serialize())}
            >
                <FormattedMessage
                    id='admin.systembus.save-graph-button'
                    defaultMessage='Save'
                />
            </button>
        </SystemBusCanvasWidget>
    );
};

export interface NodeWidgetProps {
    model: any;
    name: string;
}

class ToolboxNodeItem extends React.Component<NodeWidgetProps> {
    render() {
        return (
            <div
                draggable={true}
                onDragStart={(event) => {
                    event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                }}
                className='toolbox-node-item'
            >
                {this.props.name}
            </div>
        );
    }
}

export default Graph;
