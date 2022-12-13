// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import classnames from 'classnames';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import LocalizedIcon from 'components/localized_icon';
import {closeModal as closeModalAction} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {Visibility, WorkTemplate} from '@mattermost/types/work_templates';

import Customize from './components/customize';
import Menu from './components/menu';
import GenericModal from './components/modal';
import Preview from './components/preview';

const BackIconInHeader = styled(LocalizedIcon)`
    font-size: 24px;
    line-height: 24px;
    color: rgba(var(--center-channel-text-rbg), 0.56);
    cursor: pointer;

    &::before {
        margin-left: 0;
        margin-right: 0;
    }
`;

interface ModalTitleProps {
    text: string;
    backButtonAction?: () => void;
}

const ModalTitle = (props: ModalTitleProps) => {
    return (
        <div className='work-template-modal__title'>
            {props.backButtonAction &&
                <BackIconInHeader
                    className='icon icon-arrow-left'
                    aria-label={'Back Icon'}
                    onClick={props.backButtonAction}
                />
            }
            <span style={{marginLeft: 18}}>{props.text}</span>
        </div>
    );
};

enum ModalState {
    Menu = 'menu',
    Customize = 'customize',
    Preview = 'preview',
}

const WorkTemplateModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const [state, setState] = useState(ModalState.Menu);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkTemplate | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
    const [selectedVisibility, setSelectedVisibility] = useState(Visibility.Public);

    const closeModal = () => {
        dispatch(closeModalAction(ModalIdentifiers.WORK_TEMPLATES));
    };

    const goToMenu = () => {
        setState(ModalState.Menu);
        setSelectedTemplate(null);
    };

    const handleTemplateSelected = (template: WorkTemplate, quickUse: boolean) => {
        setSelectedTemplate(template);
        if (quickUse) {
            create(template, '');
            return;
        }

        setState(ModalState.Preview);
    };

    const handleOnNameChanged = (name: string) => {
        setSelectedName(name);
    };

    const handleOnVisibilityChanged = (visibility: Visibility) => {
        setSelectedVisibility(visibility);
    };

    const create = (template: WorkTemplate, name = '') => {
        const str = `TODO: creating elements from template ${template!.id} with name ${name || '<empty>'}`;

        // @TODO REMOVE THIS FOR PROD
        // eslint-disable-next-line no-alert
        alert(str);

        closeModal();
    };

    let title;
    let cancelButtonText;
    let cancelButtonAction;
    let confirmButtonText;
    let confirmButtonAction;
    switch (state) {
    case ModalState.Menu:
        title = formatMessage({id: 'work_templates.menu.modal_title', defaultMessage: 'Create a work template'});
        break;
    case ModalState.Preview:
        title = formatMessage({id: 'work_templates.preview.modal_title', defaultMessage: 'Preview - {useCase}'}, {useCase: selectedTemplate?.useCase});
        cancelButtonText = formatMessage({id: 'work_templates.preview.modal_cancel_button', defaultMessage: 'Back'});
        cancelButtonAction = goToMenu;
        confirmButtonText = formatMessage({id: 'work_templates.preview.modal_next_button', defaultMessage: 'Next'});
        confirmButtonAction = () => setState(ModalState.Customize);
        break;
    case ModalState.Customize:
        title = formatMessage({id: 'work_templates.customize.modal_title', defaultMessage: 'Customize - {useCase}'}, {useCase: selectedTemplate?.useCase});
        cancelButtonText = formatMessage({id: 'work_templates.customize.modal_cancel_button', defaultMessage: 'Back'});
        cancelButtonAction = () => setState(ModalState.Preview);
        confirmButtonText = formatMessage({id: 'work_templates.customize.modal_create_button', defaultMessage: 'Create'});
        confirmButtonAction = () => create(selectedTemplate!, selectedName);
        break;
    }

    return (
        <GenericModal
            id='work-template-modal'
            className={classnames('work-template-modal', `work-template-modal--${state}`)}
            modalHeaderText={
                <ModalTitle
                    text={title}
                    backButtonAction={cancelButtonAction}
                />
            }
            compassDesign={true}
            onExited={closeModal}
            cancelButtonText={cancelButtonText}
            handleCancel={cancelButtonAction}
            confirmButtonText={confirmButtonText}
            handleConfirm={confirmButtonAction}
            autoCloseOnCancelButton={false}
            autoCloseOnConfirmButton={false}
        >
            {state === ModalState.Menu && (
                <Menu
                    onTemplateSelected={handleTemplateSelected}
                />
            )}
            {(state === ModalState.Preview && selectedTemplate) && (
                <Preview
                    template={selectedTemplate}
                />
            )}
            {(state === ModalState.Customize && selectedTemplate) && (
                <Customize
                    name={selectedName}
                    visibility={selectedVisibility}
                    onNameChanged={handleOnNameChanged}
                    onVisibilityChanged={handleOnVisibilityChanged}
                />
            )}
        </GenericModal>
    );
};

export default WorkTemplateModal;
