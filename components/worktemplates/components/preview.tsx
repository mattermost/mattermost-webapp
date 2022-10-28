// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {AccordionItemType} from 'components/common/accordion/accordion';
import {WorkTemplate} from '@mattermost/types/worktemplates';
import {getTemplateDefaultIllustration} from '../utils';

import ModalBodyWithIllustration from './modal_body_with_illustration';
import Accordion from './preview/accordion';
import Chip from './preview/chip';
import PreviewSection from './preview/section';

export interface PreviewProps {
    className?: string;
    template: WorkTemplate;
}

const Preview = ({template, ...props}: PreviewProps) => {
    const {formatMessage} = useIntl();

    const [currentIllustration, setCurrentIllustration] = React.useState<string>(getTemplateDefaultIllustration(template));

    const channels = useMemo(() => template.content.filter((c) => c.channel).map((c) => c.channel!), [template.content]);
    const boards = useMemo(() => template.content.filter((c) => c.board).map((c) => c.board!), [template.content]);
    const playbooks = useMemo(() => template.content.filter((c) => c.playbook).map((c) => c.playbook!), [template.content]);
    const integrations = useMemo(() => template.content.filter((c) => c.integration).map((c) => c.integration!), [template.content]);

    // building accordion items
    const accordionItemsData: AccordionItemType[] = [];
    if (channels.length > 0) {
        accordionItemsData.push({
            id: 'channels',
            title: 'Channels',
            extraContent: <Chip>{channels.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'channels'}
                    message={template.description.channel.message}
                    items={channels}
                    onUpdateIllustration={setCurrentIllustration}
                />
            )],
        });
    }
    if (boards.length > 0) {
        accordionItemsData.push({
            id: 'boards',
            title: 'Boards',
            extraContent: <Chip>{boards.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'boards'}
                    message={template.description.board.message}
                    items={boards}
                    onUpdateIllustration={setCurrentIllustration}
                />
            )],
        });
    }
    if (playbooks.length > 0) {
        accordionItemsData.push({
            id: 'playbooks',
            title: 'Playbooks',
            extraContent: <Chip>{playbooks.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'playbooks'}
                    message={template.description.playbook.message}
                    items={playbooks}
                    onUpdateIllustration={setCurrentIllustration}
                />
            )],
        });
    }
    if (integrations.length > 0) {
        accordionItemsData.push({
            id: 'integrations',
            title: 'Integrations',
            extraContent: <Chip>{integrations.length}</Chip>,
            items: [<h1 key='integrations'>{'todo: integrations'}</h1>],
        });
    }

    // When opening an accordion section, change the illustration to whatever has been open
    const handleItemOpened = (index: number) => {
        const item = accordionItemsData[index];
        switch (item.id) {
        case 'channels':
            setCurrentIllustration(channels[0].illustration);
            break;
        case 'boards':
            setCurrentIllustration(boards[0].illustration);
            break;
        case 'playbooks':
            setCurrentIllustration(playbooks[0].illustration);
            break;
        case 'integrations':
            setCurrentIllustration(template.description.integration.illustration);
        }
    };

    return (
        <div className={props.className}>
            <ModalBodyWithIllustration illustration={currentIllustration || ''}>
                <strong>{formatMessage({id: 'worktemplates.preview.included_in_template_title', defaultMessage: 'Included in template'})}</strong>
                <Accordion
                    accordionItemsData={accordionItemsData}
                    openFirstElement={true}
                    onItemOpened={handleItemOpened}
                />
            </ModalBodyWithIllustration>
        </div>
    );
};

const StyledPreview = styled(Preview)`
    display: flex;

    strong {
        display: block;
        font-family: 'Metropolis';
        font-weight: 600;
        font-size: 18px;
        line-height: 24px;
        color: var(--center-channel-text);
        margin-bottom: 8px;
    }
`;

export default StyledPreview;
