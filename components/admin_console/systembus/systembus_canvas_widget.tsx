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
}

const SystembusCanvasWidget = ({children, engine, forceUpdate}: Props): JSX.Element => {
    const [dropDataAndPoint, setDropAndPoint] = useState<{data: any; point: any} | null>(null);
    const handleOnModalConfirm = (data: Record<string, any>) => {
        if (dropDataAndPoint) {
            createNode(['out']);
            setDropAndPoint(null);
        }
    };

    const handleOnModalCancel = () => {
        setDropAndPoint(null);
    };

    const createNode = (ports: string[]) => {
        if (dropDataAndPoint) {
            const data = dropDataAndPoint!.data;
            const node: DefaultNodeModel = new DefaultNodeModel({id: generateId(), name: data.name, color: data.color, extras: {original: data}});
            ports.forEach((port) => {
                node.addOutPort(port);
            });

            const point = dropDataAndPoint!.point;
            node.setPosition(point);
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
        if (data.nodeType === 'event') {
            createNode(['out']);
        } else if (data.nodeType === 'action') {
            createNode(['out', 'in']);
        } else if (data.nodeType === 'slash-command') {
            // TODO: ask for the slash command information and generate the right outputs
            createNode(['main']);
        } else if (data.nodeType === 'webhook') {
            // TODO: ask for the webhook secret
            setDropAndPoint({data, point});
        } else if (data.nodeType === 'flow') {
            if (data.name === 'if') {
                // TODO: ask for the if condition and check value
                createNode(['in', 'then', 'else']);
            } else if (data.name === 'switch') {
                createNode(['in', 'case 1', 'case 2', 'case 3']);

                // TODO: make this dynamic by asking the cases
            } else if (data.name === 'random') {
                // TODO: make this dynamic by asking the number of outputs
                createNode(['in', 'out 1', 'out 2', 'out 3']);
            }
        }
    };

    return (
        <div
            className='systembus__ctr'
            onDrop={onDrop}
        >
            {children}
            {dropDataAndPoint &&
                <NodeModal
                    handleOnModalCancel={handleOnModalCancel}
                    handleOnModalConfirm={handleOnModalConfirm}
                />
            }
        </div>
    );
};

export default SystembusCanvasWidget;
