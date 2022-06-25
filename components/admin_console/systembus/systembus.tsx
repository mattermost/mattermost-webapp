// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useCallback, useState, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

const SystemBusSettings: React.FunctionComponent = (): JSX.Element => {
    const [events, setEvents] = useState<any>([]);
    const [actions, setActions] = useState<any>([]);
    const [currentAction, setCurrentAction] = useState<any>(null);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [graphs, setGraphs] = useState<any>([]);
    const [newGraph, setNewGraph] = useState<{event_id: string, action_id: string, config: {[key: string]: string}}>({event_id: '', action_id: '', config: {}});

    const actionsById = useMemo(() => {
        const result: {[key: string]: any} = {};
        actions.forEach((action: any) => {
            result[action.id] = action;
        })
        return result;
    }, [actions])
    const eventsById = useMemo(() => {
        const result: {[key: string]: any} = {};
        events.forEach((event: any) => {
            result[event.id] = event;
        })
        return result;
    }, [events])

    useEffect(() => {
        Promise.all([Client4.getActionsEvents(), Client4.getActions(), Client4.getActionsGraphs()]).then(([eventsData, actionsData, graphsData]) => {
            const eventsOptions = eventsData
            eventsOptions.sort((a, b) => a.name.localeCompare(b.name));
            console.log(eventsOptions)
            setEvents(eventsOptions);
            setCurrentEvent(eventsOptions[0]);

            const actionsOptions = actionsData
            actionsOptions.sort((a, b) => a.name.localeCompare(b.name));
            console.log(actionsOptions)
            setActions(actionsOptions);
            setCurrentAction(actionsOptions[0]);

            setNewGraph({action_id: actionsOptions[0].id, event_id: eventsOptions[0].id, config: {}});

            setGraphs(graphsData);
        });
    }, []);

    const addGraph = () => {
        Client4.createActionsGraph(newGraph).then((returnedGraph: any) => {
            setGraphs([...graphs, returnedGraph]);
        });
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

            <div className='admin-console__wrapper'>
                {graphs.map((graph: any) => (
                    <div
                        key={graph.id}
                        className='admin-console__content'
                        style={{background: 'white', marginBottom: 10, padding: 10}}
                    >
                        {graph.name}
                        <button onClick={() => deleteGraph(graph.id)}>
                            <FormattedMessage
                                id='admin.systembus.delete-graph-button'
                                defaultMessage='Delete'
                            />
                        </button>
                    </div>))}
                <button onClick={() => addGraph()}>
                    <FormattedMessage
                        id='admin.systembus.add-graph-button'
                        defaultMessage='Add graph'
                    />
                </button>
            </div>
        </div>
    );
};

export default SystemBusSettings;
