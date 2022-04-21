// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import {CommandPaletteEntities} from 'components/command_palette/types';

import './filter_tag.scss';

export type Props = {
    command: string;
    entity: CommandPaletteEntities;
    isActive: boolean;
    isCommandVisible: boolean;
    label: string;
    onClick: (entity: CommandPaletteEntities) => void;
};

function FilterTag({command, entity, isActive, isCommandVisible, label, onClick}: Props) {
    let containerClassName = 'command-palette-filter-tag';
    if (isActive) {
        containerClassName += ' active';
    }
    if (isCommandVisible) {
        containerClassName += ' command-visible';
    }

    const handleOnClick = useCallback(() => {
        onClick(entity);
    }, [entity, onClick]);

    return (
        <div className={containerClassName}>
            <button
                className='style--none'
                onClick={handleOnClick}
            >{label}</button>
            {isCommandVisible && (
                <span className='command-palette-filter-tag-command'>
                    {command}
                </span>
            )}
        </div>
    );
}

export default FilterTag;
