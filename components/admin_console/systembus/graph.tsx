// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useEffect} from 'react';
import createEngine, {DiagramModel, DefaultNodeModel, DefaultLinkModel, DiagramEngine} from '@projectstorm/react-diagrams';
import {CanvasWidget} from '@projectstorm/react-canvas-core';

import SystemBusCanvasWidget from './systembus_canvas_widget';
import {MattermostLinkFactory} from './customlink';

export type CanvasGraphType = {
    id: string;
    nodes: DefaultNodeModel[];
    links: DefaultLinkModel[];
    name: string;
}

export type SubCommand = {
    subCommand: string;
    description: string;
    hint: string;
    name: string;
    flags: {[key: string]: string}
}

export type Command = {
    command: string;
    description: string;
    hint: string;
    name: string;
    subCommands: SubCommand[]
    flags: {[key: string]: string}
}

export type GraphNode = {
    actionName: string;
    command: Command;
    eventName: string;
    id: string;
    inputs: string[];
    outputs: string[];
    secret: string;
    type: string;
    controlType: string;
    ifValue: string;
    ifComparison: string;
    caseValues: string[];
    randomOptions: number;
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
}

export const Graph = ({data}: Props) => {
    const engine = useRef<DiagramEngine>()
    useEffect(() => {
        if (!engine.current) {
            engine.current = createEngine();
            engine.current.getLinkFactories().registerFactory(new MattermostLinkFactory());
        }
        //2) setup the diagram model
        const model = new DiagramModel();

        // //3-a) create another default node
        // const node1 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        // const port1 = node1.addInPort('0ut');
        // node1.setPosition(100, 100);
        //
        // //3-B) create another default node
        // const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        // const port2 = node2.addInPort('In');
        // node2.setPosition(400, 100);
        //
        // // link the ports
        // const link1 = port1.link<DefaultLinkModel>(port2);
        // link1.getOptions().testName = 'Test';
        // link1.addLabel('Hello World!');
        //
        // //4) add the models to the root graph
        // model.addAll(node1, node2, link1);
        //
        // //5) load model into engine
        // engine.setModel(model);

        //4) add the models to the root graph
        const models = model.addAll(...data.nodes, ...data.links);
        //5) load model into engine
        engine.current.setModel(model);
        	// add a selection listener to each
        models.forEach((item) => {
            item.registerListener({
                eventDidFire: (e: any) => console.log(e)
            });
        });

        model.registerListener({
            eventDidFire: (e: any) => console.log(e)
        });
    }, [data])

    if (!engine.current) {
        return null
    }

    //6) render the diagram!
    const canvas = data ? <CanvasWidget engine={engine.current}/> : undefined;

    return (
        <SystemBusCanvasWidget>
            {canvas}
        </SystemBusCanvasWidget>
    );
};

export default Graph;
