// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DefaultNodeModel} from '@projectstorm/react-diagrams';

import React, {useEffect, useMemo, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {Client4} from 'mattermost-redux/client';

import Graph, {CanvasGraphType, GraphEdge, GraphNode, GraphType} from './graph';
import {MattermostLinkModel} from './customlink';
import './systembus.scss';

const SystemBusSettings: React.FunctionComponent = (): JSX.Element => {
    const [events, setEvents] = useState<any>([]);
    const [actions, setActions] = useState<any>([]);
    const [currentAction, setCurrentAction] = useState<any>(null);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [graphs, setGraphs] = useState<GraphType[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<CanvasGraphType | null>(null);
    const [newGraph, setNewGraph] = useState<{event_id: string; action_id: string; config: {[key: string]: string}}>({event_id: '', action_id: '', config: {}});

    const actionsById = useMemo(() => {
        const result: {[key: string]: any} = {};
        actions.forEach((action: any) => {
            result[action.id] = action;
        });
        return result;
    }, [actions]);
    const eventsById = useMemo(() => {
        const result: {[key: string]: any} = {};
        events.forEach((event: any) => {
            result[event.id] = event;
        });
        return result;
    }, [events]);

    useEffect(() => {
        Promise.all([Client4.getActionsEvents(), Client4.getActions(), Client4.getActionsGraphs()]).then(([eventsData, actionsData, graphsData]) => {
            const eventsOptions = eventsData;
            eventsOptions.sort((a, b) => a.name.localeCompare(b.name));
            setEvents(eventsOptions);
            setCurrentEvent(eventsOptions[0]);

            const actionsOptions = actionsData;
            actionsOptions.sort((a, b) => a.name.localeCompare(b.name));
            setActions(actionsOptions);
            setCurrentAction(actionsOptions[0]);

            setNewGraph({action_id: actionsOptions[0].id, event_id: eventsOptions[0].id, config: {}});

            setGraphs(graphsData);
            let selected = graphsData[0];
            const modifiedData = createNodesAndEdges(selected.nodes, selected.edges);
            selected = {
                ...selected,
                nodes: modifiedData.nodes,
                links: modifiedData.links,
            };
            setSelectedGraph(selected);
        });
    }, []);

    const addGraph = () => {
        Client4.createActionsGraph(newGraph).then((returnedGraph: any) => {
            setGraphs([...graphs, returnedGraph]);
        });
    };

    const createNodesAndEdges = (nodes: GraphNode[], edges: GraphEdge[]): {nodes: DefaultNodeModel[]; links: MattermostLinkModel[]} => {
        const newNodeObject: {[key: string]: DefaultNodeModel} = {}
        const newNodes = nodes.map((node) => {
            var name = ''
            var color = 'rgb(0,192,255)'
            switch (node.type) {
                case 'event': {
                    name = node.eventName
                    color = 'rgb(255,0,128)'
                    break;
                }
                case 'action': {
                    name = node.actionName
                    color = 'rgb(0,192,255)'
                    break;
                }
                case 'webhook': {
                    name = 'webhook\n'+node.id
                    color = 'rgb(255,0,255)'
                    break;
                }
                case 'slash-command': {
                    name = node.command.command
                    color = 'rgb(127,0,255)'
                    break;
                }
                case 'flow': {
                    name = node.controlType
                    color = 'rgb(204,204,0)'
                    break;
                }
            }
            const newNode = new DefaultNodeModel({
                name: name,
                id: node.id,
                color: color,
            });
            console.log(newNode)
            newNode.setPosition(node.x || 100, node.y || 100);
            for (var portName of node.outputs) {
                newNode.addOutPort(portName)
            }
            for (var portName of node.inputs) {
                newNode.addInPort(portName)
            }
            newNodeObject[node.id] = newNode;
            return newNode;
        });
        const newEdges = edges.map((edge) => {
            let portName = 'out'
            if (edge.fromOutput) {
                portName = edge.fromOutput
            }
            console.log("edge", edge)
            console.log("portName", portName)
            const port1 = newNodeObject[edge.from].getPort(portName);
            const port2 = newNodeObject[edge.to].getPort('in');

            if (port1 && port2) {
                const link = new MattermostLinkModel();
                let label = ""
                for (const [key, value] of Object.entries(edge.config)) {
                    label += key+": "+value+"\n"
                }
                if (label) {
                    link.addLabel(label)
                }
                console.log(link);
                link.setSourcePort(port1)
                link.setTargetPort(port2)
                return link
            }
            return new MattermostLinkModel();
        });
        return {nodes: newNodes, links: newEdges};
    };

    const editGraph = (graphId: string) => {
        const selected = graphs.find((n) => n.id === graphId);
        const modifiedData = createNodesAndEdges(selected!.nodes, selected!.edges);
        const newSelected = {
            ...selected,
            nodes: modifiedData.nodes,
            links: modifiedData.links,
        };
        setSelectedGraph(newSelected);
    };

    const deleteGraph = (graphId: string) => {
        Client4.deleteActionsGraph(graphId).then(() => {
            setGraphs([...graphs.filter((l) => l.id !== graphId)]);
        });
    };

    return (
        <div className='wrapper--fixed'>
            <FormattedAdminHeader
                id='admin.systembus.system_bus_settings'
                defaultMessage='System Bus Configuration'
            />
            <div className='systembus'>
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
                {selectedGraph && <Graph data={selectedGraph}/>}
            </div>
        </div>
    );
};

export default SystemBusSettings;
