// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {SearchFilterType} from '../search/types';
import {SearchType} from 'types/store/rhs';

import FilesFilterMenu from './files_filter_menu';

import './messages_or_files_selector.scss';

type Props = {
    selected: string;
    selectedFilter: SearchFilterType;
    messagesCounter: string;
    filesCounter: string;
    onChange: (value: SearchType) => void;
    onFilter: (filter: SearchFilterType) => void;
};

export default function MessagesOrFilesSelector(props: Props): JSX.Element {
    return (
        <div className='MessagesOrFilesSelector'>
            <div className='buttons-container'>
                <span
                    onClick={() => props.onChange('messages')}
                    className={props.selected === 'messages' ? 'active tab messages-tab' : 'tab messages-tab'}
                >
                    <FormattedMessage
                        id='search_bar.messages_tab'
                        defaultMessage='Messages'
                    />
                    <span className='counter'>{props.messagesCounter}</span>
                </span>
                <span
                    onClick={() => props.onChange('files')}
                    className={props.selected === 'files' ? 'active tab files-tab' : 'tab files-tab'}
                >
                    <FormattedMessage
                        id='search_bar.files_tab'
                        defaultMessage='Files'
                    />
                    <span className='counter'>{props.filesCounter}</span>
                </span>
            </div>
            {props.selected === 'files' &&
                <FilesFilterMenu
                    selectedFilter={props.selectedFilter}
                    onFilter={props.onFilter}
                />}
        </div>
    );
}
