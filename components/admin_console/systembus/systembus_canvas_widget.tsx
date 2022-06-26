// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';

import {generateId} from 'utils/utils';

type Props = {
    children?: React.ReactNode;
    engine: DiagramEngine;
    forceUpdate: () => void
}

const SystembusCanvasWidget = ({children, engine, forceUpdate}: Props): JSX.Element => {
    return (
        <div
            className='systembus__ctr'
            onDrop={(event) => {
                const data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                const node: DefaultNodeModel = new DefaultNodeModel({id: generateId(), name: data.name, color: data.color, extras: {original: data}});
                if (data.type === 'event') {
                    node.addOutPort('out');
                } else if (data.type === 'action') {
                    node.addInPort('in');
                    node.addOutPort('out');
                } else if (data.type === 'slash-command') {
                    // TODO: ask for the slash command information and generate the right outputs
                    node.addOutPort('main');
                } else if (data.type === 'webhook') {
                    // TODO: ask for the webhook secret
                    node.addOutPort('out');
                } else if (data.type === 'flow') {
                    if (data.name == "if") {
                        // TODO: ask for the if condition and check value
                        node.addInPort('in');
                        node.addOutPort('then');
                        node.addOutPort('else');
                    } else if (data.name == "switch") {
                        node.addInPort('in');
                        // TODO: make this dynamic by asking the cases
                        node.addOutPort('case 1');
                        node.addOutPort('case 2');
                        node.addOutPort('case 3');
                    } else if (data.name == "random") {
                        node.addInPort('in');
                        // TODO: make this dynamic by asking the number of outputs
                        node.addOutPort('out-1');
                        node.addOutPort('out-2');
                        node.addOutPort('out-3');
                    }
                }
                const point = engine.getRelativeMousePoint(event);
                node.setPosition(point);
                const nodeOptions = node.getOptions()
                nodeOptions.extras.original.x = point.x
                nodeOptions.extras.original.y = point.y
                engine.getModel().addNode(node);
                forceUpdate();
            }}
        >
            {children}
        </div>
    );
};

export default SystembusCanvasWidget;
