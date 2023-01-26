// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import LocalizedIcon from 'components/localized_icon';
import {closeModal as closeModalAction} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {
    clearCategories,
    clearWorkTemplates,
    executeWorkTemplate,
    getWorkTemplateCategories,
    getWorkTemplates,
} from 'mattermost-redux/actions/work_templates';
import {Category, ExecuteWorkTemplateRequest, ExecuteWorkTemplateResponse, Visibility, WorkTemplate} from '@mattermost/types/work_templates';
import {GlobalState} from '@mattermost/types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {fetchListing} from 'actions/marketplace';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {ActionResult} from 'mattermost-redux/types/actions';
import {switchToChannelById} from 'actions/views/channel';

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

    const [modalState, setModalState] = useState(ModalState.Menu);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkTemplate | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
    const [selectedVisibility, setSelectedVisibility] = useState(Visibility.Public);
    const [currentCategoryId, setCurrentCategoryId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [errorText, setErrorText] = useState('');

    const categories = useSelector((state: GlobalState) => state.entities.worktemplates.categories);
    const workTemplates = useSelector((state: GlobalState) => state.entities.worktemplates.templatesInCategory);
    const config = useSelector(getConfig);
    const pluginsEnabled = config.PluginsEnabled === 'true' && config.EnableMarketplace === 'true' && config.IsDefaultMarketplace === 'true';
    const teamId = useSelector(getCurrentTeamId);
    const playbookTemplates = useSelector((state: GlobalState) => state.entities.worktemplates.playbookTemplates);

    // load the categories if they are not found, or load the work templates for those categories.
    useEffect(() => {
        if (categories?.length) {
            setCurrentCategoryId(categories[0].id);
            dispatch(getWorkTemplates(categories[0].id));
            return;
        }
        dispatch(getWorkTemplateCategories());
    }, [dispatch, categories]);

    useEffect(() => {
        if (pluginsEnabled) {
            dispatch(fetchListing());
        }
    }, [dispatch, pluginsEnabled]);

    useEffect(() => {
        return () => {
            dispatch(clearCategories());
            dispatch(clearWorkTemplates());
        };
    }, [dispatch]);

    // error resetter
    useEffect(() => {
        setErrorText('');
    }, [currentCategoryId, modalState, selectedTemplate, selectedVisibility]);

    const changeCategory = (category: Category) => {
        setCurrentCategoryId(category.id);
        if (workTemplates[category.id]?.length) {
            return;
        }
        dispatch(getWorkTemplates(category.id));
    };

    const closeModal = () => {
        dispatch(closeModalAction(ModalIdentifiers.WORK_TEMPLATES));
    };

    const goToMenu = () => {
        setModalState(ModalState.Menu);
        setSelectedTemplate(null);
    };

    const handleTemplateSelected = (template: WorkTemplate, quickUse: boolean) => {
        setSelectedTemplate(template);
        if (quickUse) {
            execute(template, '', template.visibility);
            return;
        }

        setModalState(ModalState.Preview);
    };

    const handleOnNameChanged = (name: string) => {
        setSelectedName(name);
    };

    const handleOnVisibilityChanged = (visibility: Visibility) => {
        setSelectedVisibility(visibility);
    };

    const execute = async (template: WorkTemplate, name = '', visibility: Visibility) => {
        const pbTemplates = [];
        for (const item of template.content) {
            if (item.playbook) {
                const pbTemplate = playbookTemplates.find((pb) => pb.title === item.playbook.template);
                if (pbTemplate) {
                    pbTemplates.push(pbTemplate);
                }
            }
        }

        const req: ExecuteWorkTemplateRequest = {
            team_id: teamId,
            name,
            visibility,
            work_template: template,
            playbook_templates: pbTemplates,
        };

        setIsCreating(true);
        const {data, error} = await dispatch(executeWorkTemplate(req)) as ActionResult<ExecuteWorkTemplateResponse>;

        if (error) {
            setIsCreating(false);
            setErrorText(error.message);
            return;
        }
        let firstChannelId = '';
        if (data?.channel_with_playbook_ids.length) {
            firstChannelId = data.channel_with_playbook_ids[0];
        } else if (data?.channel_ids.length) {
            firstChannelId = data.channel_ids[0];
        }
        if (firstChannelId) {
            dispatch(switchToChannelById(firstChannelId));
        }
        closeModal();
    };

    let title;
    let cancelButtonText;
    let cancelButtonAction;
    let confirmButtonText;
    let confirmButtonAction;
    switch (modalState) {
    case ModalState.Menu:
        title = formatMessage({id: 'work_templates.menu.modal_title', defaultMessage: 'Create a work template'});
        break;
    case ModalState.Preview:
        title = formatMessage({id: 'work_templates.preview.modal_title', defaultMessage: 'Preview - {useCase}'}, {useCase: selectedTemplate?.useCase});
        cancelButtonText = formatMessage({id: 'work_templates.preview.modal_cancel_button', defaultMessage: 'Back'});
        cancelButtonAction = goToMenu;
        confirmButtonText = formatMessage({id: 'work_templates.preview.modal_next_button', defaultMessage: 'Next'});
        confirmButtonAction = () => setModalState(ModalState.Customize);
        break;
    case ModalState.Customize:
        title = formatMessage({id: 'work_templates.customize.modal_title', defaultMessage: 'Customize - {useCase}'}, {useCase: selectedTemplate?.useCase});
        cancelButtonText = formatMessage({id: 'work_templates.customize.modal_cancel_button', defaultMessage: 'Back'});
        cancelButtonAction = () => setModalState(ModalState.Preview);
        confirmButtonText = formatMessage({id: 'work_templates.customize.modal_create_button', defaultMessage: 'Create'});
        confirmButtonAction = () => execute(selectedTemplate!, selectedName, selectedVisibility);
        break;
    }

    return (
        <GenericModal
            id='work-template-modal'
            className={classnames('work-template-modal', `work-template-modal--${modalState}`)}
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
            isConfirmDisabled={isCreating || (modalState === ModalState.Customize && errorText !== '')}
            autoCloseOnCancelButton={false}
            autoCloseOnConfirmButton={false}
            errorText={errorText}
        >
            {modalState === ModalState.Menu && (
                <Menu
                    categories={categories}
                    onTemplateSelected={handleTemplateSelected}
                    changeCategory={changeCategory}
                    workTemplates={workTemplates}
                    currentCategoryId={currentCategoryId}
                    disableQuickUse={isCreating}
                />
            )}
            {(modalState === ModalState.Preview && selectedTemplate) && (
                <Preview
                    template={selectedTemplate}
                    pluginsEnabled={pluginsEnabled}
                />
            )}
            {(modalState === ModalState.Customize && selectedTemplate) && (
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
