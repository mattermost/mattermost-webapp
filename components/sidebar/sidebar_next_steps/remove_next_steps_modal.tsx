// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import GenericModal from 'components/generic_modal';
import closeNextStepsArrow from 'images/close_next_steps_arrow.svg';
import * as Utils from 'utils/utils.jsx';

import './remove_next_steps_modal.scss';

type Props = {
    screenTitle: string;
    globalHeaderEnabled: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function RemoveNextStepsModal(props: Props) {
    const {onConfirm, onCancel, screenTitle, globalHeaderEnabled} = props;
    const renderGlobalHeaderChanges = globalHeaderEnabled && !Utils.isMobile();
    const portalRoot = renderGlobalHeaderChanges ? document.getElementById('helpMenuPortal') : document.body;
    const modalRoot = renderGlobalHeaderChanges ? document.getElementById('channel_view') : document.body;

    return (
        <>
            {ReactDOM.createPortal(
                <div
                    className={classNames(['RemoveNextStepsModal__helpBox', {'global-header': renderGlobalHeaderChanges, 'mobile-helpbox': Utils.isMobile()}])}
                >
                    <img
                        className='RemoveNextStepsModal__arrow'
                        src={closeNextStepsArrow}
                    />
                    <span className='RemoveNextStepsModal__helpText'>
                        <FormattedMarkdownMessage
                            id='remove_next_steps_modal.helpText'
                            defaultMessage={'Access {title} any time through the {menu} Menu'}
                            values={{
                                title: screenTitle,
                                menu: renderGlobalHeaderChanges ? 'Help' : 'Main',
                            }}
                        />
                    </span>
                </div>,
                portalRoot as HTMLElement,
            )}
            <GenericModal
                className='RemoveNextStepsModal'
                show={true}
                onHide={onCancel}
                handleConfirm={onConfirm}
                handleCancel={onCancel}
                container={modalRoot}
                modalHeaderText={(
                    <FormattedMarkdownMessage
                        id={'remove_next_steps_modal.header'}
                        defaultMessage={'Remove {title}?'}
                        values={{
                            title: screenTitle,
                        }}
                    />
                )}
                confirmButtonText={(
                    <FormattedMessage
                        id={'remove_next_steps_modal.confirm'}
                        defaultMessage='Remove'
                    />
                )}
            >
                <FormattedMessage
                    id={'remove_next_steps_modal.mainText'}
                    defaultMessage='This will remove this section from your sidebar, but you can access it later in the {title} section of the {menu} Menu.'
                    values={{
                        title: screenTitle,
                        menu: renderGlobalHeaderChanges ? 'Help' : 'Main',
                    }}
                />
            </GenericModal>
        </>
    );
}
