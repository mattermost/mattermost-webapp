// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState, useMemo, useEffect} from 'react';
import {useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';

import './node-modal.scss';

type Props = {
    edge: any;
    onCancel: () => void;
    onConfirm: (config: {[key: string]: string}) => void;
    actions: any[];
    events: any[];
}

const EdgeConfigModal = ({onCancel, onConfirm, edge, actions, events}: Props) => {
    const [config, setConfig] = useState<{[key: string]: string}>({});

    const intl = useIntl();
    const {formatMessage} = intl;

    const modalHeader = formatMessage({id: 'node_modal.modalTitle', defaultMessage: 'Create Edge'});

    const inNode = useMemo(() => {
        if (edge) {
            return edge.sourcePort.parent.options.extras.original;
        }
        return null;
    }, [edge, actions, events]);

    const outNode = useMemo(() => {
        if (edge) {
            return edge.targetPort.parent.options.extras.original;
        }
        return null;
    }, [edge, actions, events]);

    if (!edge) {
        return null;
    }

    let availableVariables = [];
    if (inNode.type === 'event') {
        const event = events.find((e) => e.id === inNode.eventName);
        availableVariables = event?.fields || {};
    }

    let configFields = {};
    if (outNode.type === 'event') {
        return null;
    }

    if (outNode.type === 'flow' && outNode.name === 'if') {
        configFields = {value: 'string'};
    }

    if (outNode.type === 'flow' && outNode.name === 'random') {
        return null;
    }

    if (outNode.type === 'flow' && outNode.name === 'switch') {
        configFields = {value: 'string'};
    }

    if (outNode.type === 'action') {
        const action = actions.find((e) => e.id === outNode.actionName);
        configFields = action?.config_definition || {};
    }

    const onConfirmHandler = () => {
        onConfirm(config)
        setConfig({})
    }
    const onCancelHandler = () => {
        setConfig({})
        onCancel()
    }

    return (
        <GenericModal
            id='new-edge-modal'
            className='node-modal'
            modalHeaderText={modalHeader}
            confirmButtonText={modalHeader}
            cancelButtonText={formatMessage({id: 'channel_modal.cancel', defaultMessage: 'Cancel'})}
            isConfirmDisabled={false}
            autoCloseOnConfirmButton={false}
            useCompassDesign={true}
            handleConfirm={onConfirmHandler}
            handleEnterKeyPress={onConfirmHandler}
            handleCancel={onCancelHandler}
            onExited={onCancelHandler}
        >
            <div>
                {Object.entries(configFields).map(([key, value], idx) => {
                    return (
                        <div key={key}>
                            <label
                                htmlFor={`new-edge-config-${key}`}
                            >
                                {`${key}:`}
                            </label>
                            {value === 'string' &&
                                <input
                                    id={`new-edge-config-${key}`}
                                    type='text'
                                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                                    value={config[key]}
                                    autoFocus={idx===0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onConfirm(config);
                                        }
                                    }}
                                />}
                            {value === 'number' &&
                                <input
                                    id={`new-edge-config-${key}`}
                                    type='number'
                                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                                    value={config[key]}
                                    autoFocus={idx===0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onConfirm(config);
                                        }
                                    }}
                                />}
                            {value === 'longstring' &&
                                <textarea
                                    id={`new-edge-config-${key}`}
                                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                                    value={config[key]}
                                    autoFocus={idx===0}
                                >{config[key]}</textarea>}
                            {value.indexOf('|') !== -1 &&
                                <select
                                    id={`new-edge-config-${key}`}
                                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                                    value={config[key]}
                                    autoFocus={idx===0}
                                >
                                    {value.split('|').map((option) => <option value={option}>{option}</option>)}
                                </select>}
                        </div>
                    );
                })}
                <div>{'Available variables:'}</div>
                <ul>
                    {availableVariables.map((v: any, index: number) => (
                        <li key={index}>{`{{.${v}}}`}</li>),
                    )}
                </ul>
            </div>
        </GenericModal>
    );
};

export default EdgeConfigModal;
