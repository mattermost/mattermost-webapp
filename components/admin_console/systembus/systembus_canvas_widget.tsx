// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';

import {generateId} from 'utils/utils';

import NodeModal from './node-modal/node-model';

type Props = {
    children?: React.ReactNode;
    engine: DiagramEngine;
    forceUpdate: () => void;
    graphEventHandler: any;
}
export type NodeType = 'webhook' | 'flow' | 'event' | 'action' | 'slash-command' |'switch' | 'random' |'if';

export const NodeTypeConstant = {
    WEBHOOK: 'webhook',
    FLOW: 'flow',
    EVENT: 'event',
    ACTION: 'action',
    SLASH_COMMAND: 'slash-command',
    SWITCH: 'switch',
    RANDOM: 'random',
    IF: 'if',
};

const SystembusCanvasWidget = ({children, engine, forceUpdate, graphEventHandler}: Props): JSX.Element => {
    const [dropData, setDropData] = useState<{data: any; point: any; inPorts: string[]; outPorts: string[]} | null>(null);
    const handleOnModalConfirm = (data: any) => {
        if (dropData) {
            createNode({...dropData.data, ...data}, dropData.point, dropData.inPorts, dropData.outPorts);
            setDropData(null);
        }
    };

    const handleOnModalCancel = () => {
        setDropData(null);
    };

    const createNode = (data: any, point: any, inPorts: string[], outPorts: string[]) => {
        if (data && point) {
            const id = generateId();
            if (data.type === 'webhook') {
                data.name = `webhook\n${id}`;
            }
            const node: DefaultNodeModel = new DefaultNodeModel({id, name: data.name, color: data.color, extras: {original: {id, ...data}}});
            inPorts.forEach((port) => {
                node.addInPort(port);
            });
            outPorts.forEach((port) => {
                node.addOutPort(port);
            });

            node.setPosition(point);
            node.registerListener({
                eventDidFire: graphEventHandler,
            });

            const nodeOptions = node.getOptions();
            nodeOptions.extras.original.x = point.x;
            nodeOptions.extras.original.y = point.y;
            engine.getModel().addNode(node);
            forceUpdate();
        }
    };

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        const data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
        const point = engine.getRelativeMousePoint(event);

        console.log(data, point);

        if (data.type === 'event') {
            createNode(data, point, [], ['out']);
        } else if (data.type === 'action') {
            createNode(data, point, ['in'], ['out']);
        } else if (data.type === NodeTypeConstant.SLASH_COMMAND) {
            // TODO: ask for the slash command information and generate the right outputs
            createNode(data, point, [], ['main']);
        } else if (data.type === NodeTypeConstant.WEBHOOK) {
            setDropData({data, point, inPorts: [], outPorts: ['out']});
        } else if (data.type === NodeTypeConstant.FLOW) {
            if (data.name === NodeTypeConstant.IF) {
                // TODO: ask for the if condition and check value
                createNode(data, point, ['in'], ['then', 'else']);
            } else if (data.name === NodeTypeConstant.SWITCH) {
                createNode(data, point, ['in'], ['case 1', 'case 2', 'case 3']);

                // TODO: make this dynamic by asking the cases
            } else if (data.name === NodeTypeConstant.RANDOM) {
                // TODO: make this dynamic by asking the number of outputs
                createNode(data, point, ['in'], ['out 1', 'out 2', 'out 3']);
            }
        }
    };

    return (
        <div
            className='systembus__ctr'
            onDrop={onDrop}
        >
            {children}
            {dropData &&
                <NodeModal
                    nodeType={NodeTypeConstant.WEBHOOK}
                    handleOnModalCancel={handleOnModalCancel}
                    handleOnModalConfirm={handleOnModalConfirm}
                />
            }
        </div>
    );
};

export default SystembusCanvasWidget;
