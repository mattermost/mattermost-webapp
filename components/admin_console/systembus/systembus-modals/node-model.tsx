// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useLayoutEffect, useState} from 'react';
import {useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';

import {NodeType, NodeTypeConstant} from '../systembus_canvas_widget';

import './node-modal.scss';
import IfForm from './if-form';
import RandomForm from './random-form';
import SlashCommandForm from './slash-command-form';
import SwitchForm from './switch-form';
import WebhookForm from './webhook-form';
import CronForm from './cron-form';
import IntervalForm from './interval-form';

type Props = {
    nodeType: NodeType;
    handleOnModalConfirm: (data: Record<string, any>) => void;
    handleOnModalCancel: () => void;
}

const NodeModal = ({nodeType, handleOnModalConfirm, handleOnModalCancel}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [formData, setFormData] = useState<Record<string, any> | null>(null);
    const [nodeForm, setNodeForm] = useState<JSX.Element | null>(null);

    const [modalHeader, setModalHeader] = useState(formatMessage({id: 'node_modal.modalTitle', defaultMessage: 'Create Node'}));

    useLayoutEffect(() => {
        if (nodeType === NodeTypeConstant.WEBHOOK) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.webhook', defaultMessage: 'Create Webhook Node'}));
            setNodeForm(<WebhookForm handleChange={handleChange}/>);
        } else if (nodeType === NodeTypeConstant.IF) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.if', defaultMessage: 'Create If Node'}));
            setNodeForm(<IfForm handleChange={handleChange}/>);
        } else if (nodeType === NodeTypeConstant.SLASH_COMMAND) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.slash-command', defaultMessage: 'Create Slash Command Node'}));
            setNodeForm(<SlashCommandForm handleChange={handleChange}/>);
        } else if (nodeType === NodeTypeConstant.SWITCH) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.switch', defaultMessage: 'Create Switch Node'}));
            setNodeForm(<SwitchForm handleChange={handleChange}/>);
        } else if (nodeType === NodeTypeConstant.RANDOM) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.random', defaultMessage: 'Create Random Node'}));
            setNodeForm(<RandomForm handleChange={handleChange}/>);
        } else if (nodeType === NodeTypeConstant.CRON) {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.cron', defaultMessage: 'Create Cron Node'}));
            setNodeForm(<CronForm handleChange={handleChange}/>);
        } else {
            setModalHeader(formatMessage({id: 'node_modal.modalTitle.interval', defaultMessage: 'Create Interval Node'}));
            setNodeForm(<IntervalForm handleChange={handleChange}/>);
        }
    }, [nodeType, formatMessage]);

    const handleConfirm = () => {
        handleOnModalConfirm(formData!);
    };

    const handleChange = (data: Record<string, any>) => {
        setFormData(data);
    };

    return (
        <GenericModal
            id='node-modal'
            className='node-modal'
            modalHeaderText={modalHeader}
            confirmButtonText={modalHeader}
            cancelButtonText={formatMessage({id: 'channel_modal.cancel', defaultMessage: 'Cancel'})}
            isConfirmDisabled={false}
            autoCloseOnConfirmButton={false}
            useCompassDesign={true}
            handleConfirm={handleConfirm}
            handleEnterKeyPress={handleConfirm}
            handleCancel={handleOnModalCancel}
            onExited={handleOnModalCancel}
        >
            <div className='node-modal-body'>
                {nodeForm}
            </div>
        </GenericModal>
    );
};

export default NodeModal;
