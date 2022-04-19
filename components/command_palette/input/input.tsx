// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {Entities} from '../constants';
import {} from 'components/command_palette';

interface Props {
    entities: Entities;
}

export function CommandPaletteInput({entities}: Props) {
    const [tags, setTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div>
            <i className='icon icon-magnify icon-28'/>
            {tags.map((tag, index) => (
                <div key={index}>{tag}</div>
            ))}
            <input
                type='text'
                placeholder={getInputPlaceholder(entities, tags)}
                value={searchTerm}
            />
        </div>
    );
}

function getInputPlaceholder(entities: Entities, tags: string[]): string {
    if (tags.length > 0) {
        return '';
    }

    if (entities.length === 1 && entities === Entities.GoTo) {
        return 'Go to any menu option';
    }

    if (entities.length === 1 && entities === Entities.Messages) {
        return 'Use modifiers to focus your search...';
    }

    return 'What can we help you with?';
}
