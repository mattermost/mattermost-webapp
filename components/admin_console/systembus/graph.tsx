// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import createEngine, {DiagramModel, DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';
import {CanvasWidget} from '@projectstorm/react-canvas-core';

import {generateId} from 'utils/utils';

import SystemBusCanvasWidget from './systembus_canvas_widget';
import {MattermostLinkFactory, MattermostLinkModel} from './customlink';
import Toolbox from './toolbox';
import Infobox from './infobox';
import EdgeConfigModal from './systembus-modals/edgeConfigModal';

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
    const [engine, setEngine] = useState<DiagramEngine|null>(null);
    const [newEdge, setNewEdge] = useState<any|null>(null);
    const [selectedNode, setSelectedNode] = useState<any|null>(null);

    const eventHandler = (e: any) => {
        console.log(e);
        if (e.function === 'selectionChanged' && !e.isSelected) {
            setSelectedNode(null);
        }
        if (e.function === 'selectionChanged' && e.isSelected) {
            if (!e.entity.points) {
                setSelectedNode(e.entity);
            }
        }
        if (e.function === 'linksUpdated' && e.isCreated) {
            e.link.registerListener({
                eventDidFire: eventHandler,
            });
        }
        if (e.function === 'targetPortChanged') {
            e.entity.parent.parent.clearSelection();
            e.entity.setLocked(true);
            setNewEdge(e.entity);
        }
    };

    useEffect(() => {
        let localEngine = engine;
        if (!engine) {
            const newEngine = createEngine();
            setEngine(newEngine);
            newEngine.getLinkFactories().registerFactory(new MattermostLinkFactory());
            newEngine.setMaxNumberPointsPerLink(0)
            localEngine = newEngine;
        }

        //2) setup the diagram model
        const model = new DiagramModel();

        //4) add the models to the root graph
        const models = model.addAll(...data.nodes, ...data.links);

        //5) load model into engine
        localEngine!.setModel(model);

        // add a selection listener to each
        models.forEach((item) => {
            item.registerListener({
                eventDidFire: eventHandler,
            });
        });

        model.registerListener({
            eventDidFire: eventHandler,
        });
    }, [data]);

    if (!engine) {
        return null;
    }

    const setEdgeConfig = (config: {[key: string]: string}) => {
        newEdge.setLocked(false);
        newEdge.getOptions().extras = {original: {config, id: generateId()}};
        let label = '';
        for (const [key, value] of Object.entries(config)) {
            label += key + ': ' + value + '\n';
        }
        if (label) {
            newEdge.addLabel(label);
        }
        setNewEdge(null);
    };

    //6) render the diagram!
    const canvas = data ? <CanvasWidget engine={engine}/> : undefined;

    return (
        <SystemBusCanvasWidget
            engine={engine}
            forceUpdate={() => setForceUpdate(forceUpdate + 1)}
            graphEventHandler={eventHandler}
        >
            <EdgeConfigModal
                onCancel={() => {
                    newEdge.getOptions().extras = {original: {config: {}, id: generateId()}};
                    newEdge.setLocked(false);
                    setNewEdge(null);
                }}
                onConfirm={setEdgeConfig}
                edge={newEdge}
                actions={actions}
                events={events}
            />
            <Infobox
                node={selectedNode}
            />
            <Toolbox
                actions={actions}
                events={events}
            />
            <h1 className='graph-title'>{data.name}</h1>
            {canvas}
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
                    onClick={() => onSave(engine.getModel())}
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
