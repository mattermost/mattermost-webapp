// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {CSSTransition} from 'react-transition-group'; // ES6

import {AccordionItemType} from 'components/common/accordion/accordion';

import {getTemplateDefaultIllustration} from '../utils';

import {Board, Channel, Integration, Playbook, TemplateType, WorkTemplate} from '@mattermost/types/worktemplates';

import ModalBody from './modal_body';
import Accordion from './preview/accordion';
import Chip from './preview/chip';
import PreviewSection from './preview/section';

export interface PreviewProps {
    className?: string;
    template: WorkTemplate;
}

interface IllustrationAnimations {
    prior: {
        mounted: boolean;
        type?: TemplateType;
        illustration?: string;
    };
    current: {
        mounted: boolean;
        type?: TemplateType;
        illustration?: string;
    };
}

const Preview = ({template, ...props}: PreviewProps) => {
    const {formatMessage} = useIntl();
    const nodeRefForPrior = useRef(null);
    const nodeRefForCurrent = useRef(null);

    const [illustrationDetails, setIllustrationDetails] = useState<IllustrationAnimations>(() => {
        const defaultIllustration = getTemplateDefaultIllustration(template);
        return {
            prior: {
                mounted: false,
                type: defaultIllustration?.type,
                illustration: defaultIllustration?.illustration,
            },
            current: {
                mounted: true,
                type: defaultIllustration?.type,
                illustration: defaultIllustration?.illustration,
            },
        };
    });

    useEffect(() => {
        if (illustrationDetails.prior.mounted) {
            setIllustrationDetails((prevState: IllustrationAnimations) => ({
                prior: {
                    ...prevState.prior,
                    mounted: false,
                },
                current: {
                    ...prevState.current,
                    mounted: true,
                },
            }));
        }
    }, [illustrationDetails.prior.mounted]);

    const [channels, boards, playbooks, integrations] = useMemo(() => {
        const channels: Channel[] = [];
        const boards: Board[] = [];
        const playbooks: Playbook[] = [];
        const integrations: Integration[] = [];
        template.content.forEach((c) => {
            if (c.channel) {
                channels.push(c.channel);
            }
            if (c.board) {
                boards.push(c.board);
            }
            if (c.playbook) {
                playbooks.push(c.playbook);
            }
            if (c.integration) {
                integrations.push(c.integration);
            }
        });
        return [channels, boards, playbooks, integrations];
    }, [template.content]);

    // building accordion items
    const accordionItemsData: AccordionItemType[] = [];
    if (channels.length > 0) {
        accordionItemsData.push({
            id: 'channels',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_channels', defaultMessage: 'Channels'}),
            extraContent: <Chip>{channels.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'channels'}
                    message={template.description.channel.message}
                    items={channels}
                    onUpdateIllustration={(id: string, illustration: string) => setIllustrationDetails({
                        prior: {...illustrationDetails.current},
                        current: {
                            mounted: false,
                            type: TemplateType.CHANNELS,
                            illustration,
                        },
                    })}
                />
            )],
        });
    }
    if (boards.length > 0) {
        accordionItemsData.push({
            id: 'boards',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_boards', defaultMessage: 'Boards'}),
            extraContent: <Chip>{boards.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'boards'}
                    message={template.description.board.message}
                    items={boards}
                    onUpdateIllustration={(id: string, illustration: string) => setIllustrationDetails({
                        prior: {...illustrationDetails.current},
                        current: {
                            mounted: false,
                            type: TemplateType.BOARDS,
                            illustration,
                        },
                    })}
                />
            )],
        });
    }
    if (playbooks.length > 0) {
        accordionItemsData.push({
            id: 'playbooks',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_playbooks', defaultMessage: 'Playbooks'}),
            extraContent: <Chip>{playbooks.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'playbooks'}
                    message={template.description.playbook.message}
                    items={playbooks}
                    onUpdateIllustration={(id: string, illustration: string) => setIllustrationDetails({
                        prior: {...illustrationDetails.current},
                        current: {
                            mounted: false,
                            type: TemplateType.PLAYBOOKS,
                            illustration,
                        },
                    })}
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
            setIllustrationDetails({
                prior: {
                    ...illustrationDetails.current,
                    mounted: true,
                },
                current: {
                    mounted: false,
                    type: TemplateType.CHANNELS,
                    illustration: channels[0].illustration,
                },
            });
            break;
        case 'boards':
            setIllustrationDetails({
                prior: {
                    ...illustrationDetails.current,
                    mounted: true,
                },
                current: {
                    mounted: false,
                    type: TemplateType.BOARDS,
                    illustration: boards[0].illustration,
                },
            });
            break;
        case 'playbooks':
            setIllustrationDetails({
                prior: {
                    ...illustrationDetails.current,
                    mounted: true,
                },
                current: {
                    mounted: false,
                    type: TemplateType.PLAYBOOKS,
                    illustration: playbooks[0].illustration,
                },
            });
            break;
        case 'integrations':
            setIllustrationDetails({
                prior: {
                    ...illustrationDetails.current,
                    mounted: true,
                },
                current: {
                    mounted: false,
                    type: TemplateType.INTEGRATIONS,
                    illustration: template.description.integration.illustration,
                },
            });
        }
    };

    return (
        <div className={props.className}>
            <ModalBody>
                <strong>{formatMessage({id: 'worktemplates.preview.included_in_template_title', defaultMessage: 'Included in template'})}</strong>
                <Accordion
                    accordionItemsData={accordionItemsData}
                    openFirstElement={true}
                    onItemOpened={handleItemOpened}
                />
            </ModalBody>
            <div className='img-wrapper'>
                <CSSTransition
                    nodeRef={nodeRefForPrior}
                    in={illustrationDetails.prior.mounted}
                    timeout={{
                        appear: 0,
                        enter: 200,
                        exit: 200,
                    }}
                    classNames='prior-illustration'
                >
                    <img
                        ref={nodeRefForPrior}
                        src={illustrationDetails.prior.illustration}
                    />
                </CSSTransition>
                <CSSTransition
                    nodeRef={nodeRefForCurrent}
                    in={illustrationDetails.current.mounted}
                    timeout={{
                        appear: 0,
                        enter: 200,
                        exit: 200,
                    }}
                    classNames='current-illustration'
                >
                    <img
                        ref={nodeRefForCurrent}
                        src={illustrationDetails.current.illustration}
                    />
                </CSSTransition>
            </div>
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

    .img-wrapper {
        position: relative;
        width: 100%;
    }

    img {
        box-shadow: var(--elevation-2);
        border-radius: 8px;
        position: absolute;
    }

    .prior-illustration-enter {
      opacity: 0;
    }

    .prior-illustration-enter-done {
      opacity: 0;
    }

    .prior-illustration-exit {
      opacity: 1;
    }

    .prior-illustration-exit-active {
      opacity: 0;
      transition: opacity 200ms ease-in-out;
    }

    .prior-illustration-exit-done {
      opacity: 0;

    }

    .current-illustration-enter {
      opacity: 0;
    }

    .current-illustration-enter-active {
      opacity: 1;
      transition: opacity 200ms ease-in-out;
    }

    .current-illustration-enter-done {
      opacity: 1;
    }

    .current-illustration-exit {
      opacity: 0;
    }

    .current-illustration-exit-done {
      opacity: 0;
    }
`;

export default StyledPreview;
