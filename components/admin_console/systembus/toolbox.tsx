// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

type Props = {
    events: any[]
    actions: any[]
}

export const Toolbox = ({events, actions}: Props) => {
    return (
        <div className='graph-toolbox'>
            <h2>Events</h2>
            {events.map((event) => (
                <ToolboxNodeItem
                    nodeType='event'
                    name={event.name}
                    model={{
                        nodeType: 'event',
                        name: event.name,
                        color: 'rgb(255,0,128)',
                    }}
                />))}
            <h2>Actions</h2>
            {actions.map((action) => (
                <ToolboxNodeItem
                    nodeType='action'
                    name={action.name}
                    model={{
                        nodeType: 'action',
                        name: action.name,
                        color: 'rgb(0,192,255)',
                    }}
                />))}
            <h2>Flow control</h2>
            <ToolboxNodeItem
                nodeType='flow'
                name="If"
                model={{
                    nodeType: 'flow',
                    name: "if",
                    color: 'rgb(204,204,0)',
                }}
            />
            <ToolboxNodeItem
                name="Switch"
                nodeType='flow'
                model={{
                    nodeType: 'flow',
                    name: "switch",
                    color: 'rgb(204,204,0)',
                }}
            />
            <ToolboxNodeItem
                name="Random"
                nodeType='flow'
                model={{
                    nodeType: 'flow',
                    name: "random",
                    color: 'rgb(204,204,0)',
                }}
            />
            <h2>Trigger</h2>
            <ToolboxNodeItem
                name="Slash Command"
                nodeType='slash-command'
                model={{
                    nodeType: 'slash-command',
                    name: "slash-command",
                    color: 'rgb(127,0,255)',
                }}
            />
            <ToolboxNodeItem
                name="Webhook"
                nodeType='webhook'
                model={{
                    nodeType: 'webhook',
                    name: "webhook",
                    color: 'rgb(255,0,255)',
                }}
            />
        </div>
    );
};

export interface ToolboxProps {
    model: any;
    name: string;
    nodeType: string;
}

class ToolboxNodeItem extends React.Component<ToolboxProps> {
    render() {
        return (
            <div
                draggable={true}
                onDragStart={(event) => {
                    event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                }}
                className={`toolbox-node-item toolbox-node-item-${this.props.nodeType}`}
            >
                {this.props.name}
            </div>
        );
    }
}

export default Toolbox;
