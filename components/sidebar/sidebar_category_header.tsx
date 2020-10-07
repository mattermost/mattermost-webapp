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

const SidebarCategoryHeader = React.forwardRef((props: Props, ref?: React.Ref<HTMLDivElement & HTMLButtonElement>) => {
    const Element = props.onClick ? 'button' : 'div';

    return (
        <div className='SidebarChannelGroupHeader'>
            <Element
                ref={ref}
                className={classNames('SidebarChannelGroupHeader_groupButton', {
                    dragging: props.isDragging,
                })}
                aria-label={props.displayName}
                onClick={props.onClick}
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
            </Element>
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
