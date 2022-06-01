// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useCallback, useState, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

const SystemBusSettings: React.FunctionComponent = (): JSX.Element => {
    const [events, setEvents] = useState([]);
    const [actions, setActions] = useState([]);
    const [currentAction, setCurrentAction] = useState<any>(null);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState<{event_id: string, action_id: string, config: {[key: string]: string}}>({event_id: '', action_id: '', config: {}});

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
        Promise.all([Client4.getSystemBusEvents(), Client4.getSystemBusActions(), Client4.getSystemBusLinks()]).then(([eventsData, actionsData, linksData]) => {
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

            setNewLink({action_id: actionsOptions[0].id, event_id: eventsOptions[0].id, config: {}});

            setLinks(linksData);
        });
    }, []);

    const addLink = () => {
        Client4.createSystemBusLink(newLink).then((returnedLink: any) => {
            setLinks([...links, returnedLink]);
        });
    };

    const deleteLink = (linkId: string) => {
        Client4.deleteSystemBusLink(linkId).then(() => {
            setLinks([...links.filter((l) => l.id !== linkId)]);
        });
    };

    return (
        <div className='wrapper--fixed'>
            <FormattedAdminHeader
                id='admin.systembus.system_bus_settings'
                defaultMessage='System Bus Configuration'
            />

            <div className='admin-console__wrapper'>
                {links.map((link: any) => (
                    <div
                        key={link.id}
                        className='admin-console__content'
                        style={{background: 'white', marginBottom: 10, padding: 10}}
                    >
                        <div style={{display: 'flex'}}>
                            <div>{eventsById[link.event_id]?.name}</div>
                            <div>{' ==> '}</div>
                            <div>{actionsById[link.action_id]?.name}</div>
                            <div>
                                <div>{'Config: '}</div>
                                {Object.entries(link.config).map(([key, value]) => (
                                    <div key={key}>{key}{': '}{value}</div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => deleteLink(link.id)}>
                            <FormattedMessage
                                id='admin.systembus.delete-link-button'
                                defaultMessage='Delete'
                            />
                        </button>
                    </div>))}
                <div
                    className='admin-console__content'
                    style={{background: 'white', padding: 10}}
                >
                    <h3>
                        <FormattedMessage
                            id='admin.systembus.link-events-to-actions'
                            defaultMessage='Link events to actions'
                        />
                    </h3>
                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='event'
                        >
                            <FormattedMessage
                                id='admin.systembus.event-field-label'
                                defaultMessage='Event:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <select
                                id='event'
                                onChange={(e) => {
                                    const eventId = e.target.value;
                                    setCurrentEvent(eventsById[eventId]);
                                    setNewLink({...newLink, event_id: eventId});
                                }}
                            >
                                {events.map((event: any) => (
                                    <option
                                        key={event.id}
                                        id={event.id}
                                        value={event.id}
                                    >
                                        {event.name}
                                    </option>))}
                            </select>
                            {currentEvent &&
                                <div className='help-text'>
                                    {currentEvent.description}
                                </div>}
                        </div>
                    </div>
                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='action'
                        >
                            <FormattedMessage
                                id='admin.systembus.action-field-label'
                                defaultMessage='Action:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <select
                                id='action'
                                onChange={(e) => {
                                    const actionId = e.target.value;
                                    setCurrentAction(actionsById[actionId]);
                                    setNewLink({...newLink, action_id: actionId});
                                }}
                            >
                                {actions.map((action: any) => (
                                    <option
                                        key={action.id}
                                        id={action.id}
                                        value={action.id}
                                    >
                                        {action.name}
                                    </option>))}
                            </select>
                            {currentAction &&
                                <div className='help-text'>
                                    {currentAction.description}
                                </div>}
                        </div>
                    </div>
                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='action_config'
                        >
                            <FormattedMessage
                                id='admin.systembus.action-config-field-label'
                                defaultMessage='Action config:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            {currentAction &&
                                <div className='help-text'>
                                    {Object.keys(currentAction.config_definition).map((key) => (
                                        <div key={key}>
                                            <label htmlFor={`config-field-${key}`}>{key}</label>
                                            <input
                                                type='text'
                                                id={`config-field-${key}`}
                                                onChange={(e) => {
                                                    setNewLink({...newLink, config: {...newLink.config, [key]: e.target.value}});
                                                }}
                                                value={newLink.config[key] || ''}
                                            />
                                        </div>
                                    ))}
                                </div>}
                            {currentEvent &&
                                <div className='help-text'>
                                    <FormattedMessage
                                        id='admin.systembus.available-template-variables'
                                        defaultMessage='Available template variables: '
                                    />
                                    {currentEvent?.fields?.map((x) => `{{.${x}}}`).join(', ')}
                                </div>}
                        </div>
                    </div>
                    <button onClick={() => addLink()}>
                        <FormattedMessage
                            id='admin.systembus.add-link-button'
                            defaultMessage='Add link'
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemBusSettings;
