// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState, useMemo} from 'react';

import GenericModal from 'components/generic_modal';

type Props = {
    edge: any;
    onCancel: () => void;
    onConfirm: (config: {[key:string]: string}) => void;
    actions: any[];
    events: any[];
}

const EdgeConfigModal = ({onCancel, onConfirm, edge, actions, events}: Props) => {
    const [config, setConfig] = useState<{[key: string]: string}>({});

    const inNode = useMemo(() => {
        if (edge) {
            return edge.sourcePort.parent.options.extras.original
        }
        return null
    }, [edge, actions, events])

    const outNode = useMemo(() => {
        if (edge) {
            return edge.targetPort.parent.options.extras.original
        }
        return null;
    }, [edge, actions, events])

    if (!edge) {
        return null
    }

    let availableVariables = []
    if (inNode.type === "event") {
        const event = events.find((e) => e.id == inNode.eventName)
        availableVariables = event?.fields || {}
    }

    let configFields = {}
    if (outNode.type === "event") {
        return null
    }

    if (outNode.type === "flow" && outNode.name === "if") {
        configFields = {value: "string"}
    }

    if (outNode.type === "flow" && outNode.name === "random") {
        return null
    }

    if (outNode.type === "flow" && outNode.name === "switch") {
        configFields = {value: "string"}
    }

    if (outNode.type === "action") {
        const action = actions.find((e) => e.id == outNode.actionName)
        configFields = action?.config_definition || {}
    }

    return (
        <GenericModal
            id='new-graph-title-modal'
            onExited={onCancel}
            handleCancel={onCancel}
            handleConfirm={() => onConfirm(config)}
            modalHeaderText='New Edge'
        >
            <div>
                {Object.entries(configFields).map(([key, value]) => {
                    if (value === "string") {
                        return (
                            <div key={key}>
                                <label
                                    htmlFor={`new-edge-config-${key}`}
                                >
                                    {key}:
                                </label>
                                <input
                                    id={`new-edge-config-${key}`}
                                    type='text'
                                    id='new-graph-title'
                                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                                    value={config[key]}
                                    autoFocus={true}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onConfirm(config);
                                        }
                                    }}
                                />
                            </div>
                        )
                    }
                    return null;
                })}
                <div>Available variables:</div>
                <ul>
                    {availableVariables.map((v) => (
                        <li>{`{{.${v}}}`}</li>)
                    )}
                </ul>
            </div>
        </GenericModal>
    );
};

export default EdgeConfigModal;
