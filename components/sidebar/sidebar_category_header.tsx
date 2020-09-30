// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';

import {wrapEmojis} from 'utils/emoji_utils';

type Props = {
    children?: React.ReactNode;
    displayName: string;
    dragHandleProps?: DraggableProvidedDragHandleProps;
    isCollapsed?: boolean;
    isCollapsible?: boolean;
    isDragging?: boolean;
    isDraggingOver?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const SidebarCategoryHeader = React.forwardRef((props: Props, ref?: React.Ref<HTMLDivElement>) => {
    return (
        <div className='SidebarChannelGroupHeader'>
            <div
                ref={ref}
                className={classNames('SidebarChannelGroupHeader_groupButton', {
                    clickable: Boolean(props.onClick),
                    dragging: props.isDragging,
                })}
                aria-label={props.displayName}
                onClick={props.onClick}
                role='button'
                tabIndex={0}
            >
                <i
                    className={classNames('icon icon-chevron-down', {
                        'icon-rotate-minus-90': props.isCollapsed,
                        'hide-arrow': !props.isCollapsible,
                    })}
                />
                <div {...props.dragHandleProps}>
                    {wrapEmojis(props.displayName)}
                </div>
            </div>
            {props.children}
        </div>
    );
});
SidebarCategoryHeader.defaultProps = {
    isCollapsible: true,
    isDragging: false,
    isDraggingOver: false,
};
SidebarCategoryHeader.displayName = 'SidebarCategoryHeader';

export default SidebarCategoryHeader;
