// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {DefaultNodeModel, DiagramEngine} from '@projectstorm/react-diagrams';

import {generateId} from 'utils/utils';

type Props = {
    children?: React.ReactNode;
    engine: DiagramEngine;
}

const SystembusCanvasWidget = ({children, engine}: Props): JSX.Element => {
    const [forceUpdate, setForceUpdate] = useState<number>(0);
    return (
        <div
            className='systembus__ctr'
            onDrop={(event) => {
                const data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                console.log('Dropping object', data);
                const node: DefaultNodeModel = new DefaultNodeModel({id: generateId(), ...data});
                if (data.name === 'event') {
                    node.addOutPort('out');
                } else if (data.name === 'action') {
                    node.addInPort('in');
                    node.addOutPort('out');
                }
                const point = engine.getRelativeMousePoint(event);
                node.setPosition(point);
                engine.getModel().addNode(node);
                setForceUpdate(forceUpdate + 1);
            }}
        >
            {children}
        </div>
    );
};

export default SystembusCanvasWidget;
