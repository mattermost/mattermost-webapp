// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DefaultNodeModel} from '@projectstorm/react-diagrams';

import React, {useCallback, useEffect, useState} from 'react';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {Client4} from 'mattermost-redux/client';

import Graph, {CanvasGraphType, GraphEdge, GraphNode, GraphType} from './graph';
import GraphTitleModal from './systembus-modals/graph-title-modal';

import {MattermostLinkModel} from './customlink';
import GraphList from './graph-list';
import './systembus.scss';

const SystemBusSettings: React.FunctionComponent = (): JSX.Element => {
    const [newGraphOpen, setNewGraphOpen] = useState<boolean>(false);
    const [events, setEvents] = useState<any>([]);
    const [actions, setActions] = useState<any>([]);
    const [graphs, setGraphs] = useState<GraphType[]>([]);
    const [selectedGraph, setSelectedGraph] = useState<CanvasGraphType | null>(null);
    const [newGraph, setNewGraph] = useState<{event_id: string; action_id: string; config: {[key: string]: string}}>({event_id: '', action_id: '', config: {}});

    useEffect(() => {
        Promise.all([Client4.getActionsEvents(), Client4.getActions(), Client4.getActionsGraphs()]).then(([eventsData, actionsData, graphsData]) => {
            const eventsOptions = eventsData;
            eventsOptions.sort((a, b) => a.name.localeCompare(b.name));
            setEvents(eventsOptions);

            const actionsOptions = actionsData;
            actionsOptions.sort((a, b) => a.name.localeCompare(b.name));
            setActions(actionsOptions);

            setNewGraph({action_id: actionsOptions[0].id, event_id: eventsOptions[0].id, config: {}});

            graphsData.sort((a, b) => a.name.localeCompare(b.name));
            setGraphs(graphsData);
        });
    }, []);

    const addGraphRequest = () => {
        setNewGraphOpen(true);
    };

    const addGraph = (title: string) => {
        Client4.createActionsGraph({...newGraph, name: title}).then((returnedGraph: any) => {
            setGraphs([...graphs, {...returnedGraph, nodes: returnedGraph.nodes || [], edges: returnedGraph.edges || []}]);
            const selected = returnedGraph;
            const modifiedData = createNodesAndEdges(selected!.nodes || [], selected!.edges || []);
            const newSelected = {
                ...selected!,
                nodes: modifiedData.nodes,
                links: modifiedData.links,
                original: selected!,
            };
            setSelectedGraph(newSelected);
        });
        setNewGraphOpen(false);
    };

    const createNodesAndEdges = (nodes: GraphNode[], edges: GraphEdge[]): {nodes: DefaultNodeModel[]; links: MattermostLinkModel[]} => {
        const newNodeObject: {[key: string]: DefaultNodeModel} = {};
        const newNodes = nodes.map((node) => {
            let name = '';
            let color = 'rgb(0,192,255)';
            switch (node.type) {
            case 'event': {
                name = node.eventName!;
                color = 'rgb(255,0,128)';
                break;
            }
            case 'action': {
                name = node.actionName!;
                color = 'rgb(0,192,255)';
                break;
            }
            case 'webhook': {
                name = 'webhook\n' + node.id;
                color = 'rgb(127,0,255)';
                break;
            }
            case 'slash-command': {
                name = node.command!.command;
                color = 'rgb(127,0,255)';
                break;
            }
            case 'flow': {
                name = node.controlType!;
                color = 'rgb(204,204,0)';
                break;
            }
            case 'sched': {
                name = node.controlType!;
                color = 'rgb(127,0,255)';
                break;
            }
            }
            const newNode = new DefaultNodeModel({
                name,
                id: node.id,
                color,
                extras: {
                    original: node,
                },
            });
            newNode.setPosition(node.x || 100, node.y || 100);
            for (const portName of node.outputs) {
                newNode.addOutPort(portName);
            }
            for (const portName of node.inputs) {
                newNode.addInPort(portName);
            }
            newNodeObject[node.id] = newNode;
            return newNode;
        });
        const newEdges = edges.map((edge) => {
            let portName = 'out';
            if (edge.fromOutput) {
                portName = edge.fromOutput;
            }
            const port1 = newNodeObject[edge.from].getPort(portName);
            const port2 = newNodeObject[edge.to].getPort('in');

            if (port1 && port2) {
                const link = new MattermostLinkModel();
                let label = '';
                for (const [key, value] of Object.entries(edge.config)) {
                    label += key + ': ' + value + '\n';
                }
                if (label) {
                    link.addLabel(label);
                }
                link.getOptions().extras = {original: edge};
                link.setSourcePort(port1);
                link.setTargetPort(port2);
                return link;
            }
            return new MattermostLinkModel();
        });
        return {nodes: newNodes, links: newEdges};
    };

    const editGraph = useCallback((graphId: string) => {
        const selected = graphs.find((n) => n.id === graphId);
        const modifiedData = createNodesAndEdges(selected!.nodes, selected!.edges);
        const newSelected = {
            ...selected!,
            nodes: modifiedData.nodes,
            links: modifiedData.links,
            original: selected!,
        };
        setSelectedGraph(newSelected);
    }, [graphs]);

    const deleteGraph = (graphId: string) => {
        Client4.deleteActionsGraph(graphId).then(() => {
            setGraphs([...graphs.filter((l) => l.id !== graphId)]);
        });
    };

    const onSave = useCallback(async (data: any) => {
        const orig = selectedGraph?.original;
        const updatedGraph = {
            id: orig?.id,
            name: orig?.name,
            nodes: Object.values(data.layers[1].models).map((n: any) => {
                const orig = n.getOptions().extras.original;
                return {
                    actionName: orig.actionName,
                    command: orig.command,
                    eventName: orig.eventName,
                    id: orig.id,
                    secret: orig.secret,
                    type: orig.type,
                    controlType: orig.controlType,
                    ifValue: orig.ifValue,
                    ifComparison: orig.ifComparison,
                    caseValues: orig.caseValues,
                    randomOptions: orig.randomOptions,
                    cron: orig.cron,
                    seconds: orig.seconds,
                    x: Math.trunc(n.position.x),
                    y: Math.trunc(n.position.y),
                };
            }),
            edges: Object.values(data.layers[0].models).map((e: any) => {
                const orig = e.getOptions().extras.original;
                return {
                    config: orig.config,
                    from: e.sourcePort.parent.getOptions().id,
                    fromOutput: e.sourcePort.getOptions().name === 'out' ? '' : e.sourcePort.getOptions().name,
                    id: orig.id,
                    to: e.targetPort.parent.getOptions().id,
                };
            }),
        };
        await Client4.updateActionsGraph(updatedGraph);
        const graphsData = await Client4.getActionsGraphs();
        graphsData.sort((a, b) => a.name.localeCompare(b.name));
        setGraphs(graphsData);
        setSelectedGraph(null);
    }, [selectedGraph]);

    const onCancel = () => {
        setSelectedGraph(null);
    };

    return (
        <div className='wrapper--fixed'>
            {newGraphOpen && (
                <GraphTitleModal
                    handleOnModalConfirm={addGraph}
                    handleOnModalCancel={() => setNewGraphOpen(false)}
                />
            )}
            <FormattedAdminHeader
                id='admin.systembus.system_bus_settings'
                defaultMessage='System Bus Configuration'
            />
            <div className='systembus'>
                {!selectedGraph &&
                    <GraphList
                        graphs={graphs}
                        editGraph={editGraph}
                        deleteGraph={deleteGraph}
                        addGraph={addGraphRequest}
                    />
                }
                {selectedGraph &&
                    <Graph
                        data={selectedGraph!}
                        onSave={onSave}
                        onCancel={onCancel}
                        actions={actions}
                        events={events}
                    />
                }
            </div>
        </div>
    );
};

export default SystemBusSettings;
