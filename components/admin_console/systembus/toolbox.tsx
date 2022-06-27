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
                    name={event.name}
                    model={{
                        type: 'event',
                        name: event.name,
                        eventName: event.id,
                        color: 'rgb(255,0,128)',
                    }}
                />))}
            <h2>Actions</h2>
            {actions.map((action) => (
                <ToolboxNodeItem
                    name={action.name}
                    model={{
                        type: 'action',
                        name: action.name,
                        actionName: action.id,
                        color: 'rgb(0,192,255)',
                    }}
                />))}
            <h2>Flow control</h2>
            <ToolboxNodeItem
                name="If"
                model={{
                    type: 'flow',
                    name: "if",
                    controlType: "if",
                    color: 'rgb(204,204,0)',
                }}
            />
            <ToolboxNodeItem
                name="Switch"
                model={{
                    type: 'flow',
                    name: "switch",
                    controlType: "switch",
                    color: 'rgb(204,204,0)',
                }}
            />
            <ToolboxNodeItem
                name="Random"
                model={{
                    type: 'flow',
                    name: "random",
                    controlType: "random",
                    color: 'rgb(204,204,0)',
                }}
            />
            <h2>Trigger</h2>
            <ToolboxNodeItem
                name="Slash Command"
                model={{
                    type: 'slash-command',
                    name: "slash-command",
                    color: 'rgb(127,0,255)',
                }}
            />
            <ToolboxNodeItem
                name="Webhook"
                model={{
                    type: 'webhook',
                    name: "webhook",
                    color: 'rgb(127,0,255)',
                }}
            />
            <ToolboxNodeItem
                name="Cron"
                model={{
                    type: 'sched',
                    name: "cron",
                    controlType: "cron",
                    color: 'rgb(127,0,255)',
                }}
            />
            <ToolboxNodeItem
                name="Interval"
                model={{
                    type: 'sched',
                    name: "interval",
                    controlType: "interval",
                    color: 'rgb(127,0,255)',
                }}
            />
        </div>
    );
};

export interface ToolboxProps {
    model: any;
    name: string;
}

class ToolboxNodeItem extends React.Component<ToolboxProps> {
    render() {
        return (
            <div
                draggable={true}
                onDragStart={(event) => {
                    event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                }}
                className={`toolbox-node-item toolbox-node-item-${this.props.model.type}`}
            >
                {this.props.name}
            </div>
        );
    }
}

export default Toolbox;
