// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef, memo} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import styled from 'styled-components';

import {AlertOutlineIcon, AlertCircleOutlineIcon, MessageTextOutlineIcon} from '@mattermost/compass-icons/components';

import {PostPriority} from '@mattermost/types/posts';

import Badge from 'components/widgets/badges/badge';

import Menu, {MenuItem} from './post_priority_picker_item';

type Props = {
    priority?: PostPriority;
    onClose: () => void;
    onApply: (props: {priority?: PostPriority}) => void;
    placement: string;
    rightOffset?: number;
    topOffset?: number;
    leftOffset?: number;
    style?: React.CSSProperties;
}

const Beta = styled(Badge)`
    margin-left: 8px;
`;

const UrgentIcon = styled(AlertOutlineIcon)`
    fill: rgb(var(--semantic-color-danger));
`;

const ImportantIcon = styled(AlertCircleOutlineIcon)`
    fill: rgb(var(--semantic-color-info));
`;

const StandardIcon = styled(MessageTextOutlineIcon)`
    fill: var(--center-channel-color-56);
`;

const Header = styled.h4`
    display: flex;
    align-items: center;
    padding: 14px 20px;
    margin-right: 4px;
    font-family: Open Sans;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 20px;
    text-align: left;
`;

const Body = styled.div`
    border-top: 1px solid rgba(var(--center-channel-text-rgb), 0.08);
`;

const Picker = styled.div`
    position: absolute;
    z-index: 1100;
    display: flex;
    width: 220px;
    flex-direction: column;
    border: 1px solid $light-gray;
    margin-right: 3px;
    background: var(--center-channel-bg);
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    user-select: none;
    overflow: hidden;
    *zoom: 1;
`;

function PostPriorityPicker({
    priority,
    onClose,
    onApply,
    placement,
    rightOffset = 0,
    topOffset = 0,
    leftOffset = 0,
    style,
}: Props) {
    const {formatMessage} = useIntl();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, [ref.current]);

    const handleSelect = useCallback((type?: PostPriority) => () => {
        onApply({priority: type});
        onClose();
    }, [onApply, onClose]);

    let pickerStyle: React.CSSProperties = {};
    if (style && !(style.left === 0 && style.top === 0)) {
        if (placement === 'top' || placement === 'bottom') {
            // Only take the top/bottom position passed by React Bootstrap since we want to be left-aligned
            pickerStyle = {
                top: style.top,
                bottom: style.bottom,
                left: leftOffset,
            };
        } else {
            pickerStyle = {...style};
        }

        pickerStyle.top = pickerStyle.top ? Number(pickerStyle.top) + topOffset : topOffset;

        if (pickerStyle.right) {
            pickerStyle.right = Number(pickerStyle.right) + rightOffset;
        }
    }

    return (
        <Picker
            ref={ref}
            tabIndex={-1}
            style={pickerStyle}
            className={classNames({PostPriorityPicker: true, bottom: placement === 'bottom'})}
        >
            <Header className='modal-title mr-2'>
                {formatMessage({
                    id: 'post_priority.picker.header',
                    defaultMessage: 'Message priority',
                })}
                <Beta
                    uppercase={true}
                    variant='info'
                    size='xs'
                >
                    {'BETA'}
                </Beta>
            </Header>
            <Body role='application'>
                <Menu className='Menu'>
                    <MenuItem
                        id='menu-item-priority-standard'
                        onClick={handleSelect()}
                        isSelected={priority === undefined}
                        icon={<StandardIcon size={18}/>}
                        text={formatMessage({
                            id: 'post_priority.priority.standard',
                            defaultMessage: 'Standard',
                        })}
                    />
                    <MenuItem
                        id='menu-item-priority-important'
                        onClick={handleSelect(PostPriority.IMPORTANT)}
                        isSelected={priority === PostPriority.IMPORTANT}
                        icon={<ImportantIcon size={18}/>}
                        text={formatMessage({
                            id: 'post_priority.priority.important',
                            defaultMessage: 'Important',
                        })}
                    />
                    <MenuItem
                        id='menu-item-priority-urgent'
                        onClick={handleSelect(PostPriority.URGENT)}
                        isSelected={priority === PostPriority.URGENT}
                        icon={<UrgentIcon size={18}/>}
                        text={formatMessage({
                            id: 'post_priority.priority.urgent',
                            defaultMessage: 'Urgent',
                        })}
                    />
                </Menu>
            </Body>
        </Picker>
    );
}

export default memo(PostPriorityPicker);
