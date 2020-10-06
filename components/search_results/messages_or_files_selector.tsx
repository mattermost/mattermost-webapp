// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './messages_or_files_selector.scss';

type Props = {
    selected: string;
    selectedFilter: string;
    onChange: (value: string) => void;
    onFilter: (filter: string) => void;
};

export default function MessagesOrFilesSelector(props: Props): React.ReactNode {
    return (
        <div className='MessagesOrFilesSelector'>
            <div>
                <a
                    onClick={() => props.onChange('messages')}
                    className={props.selected === 'messages' ? 'active' : ''}
                >
                    <FormattedMessage
                        id='search_bar.messages_tab'
                        defaultMessage='Messages'
                    />
                </a>
                <a
                    onClick={() => props.onChange('files')}
                    className={props.selected === 'files' ? 'active' : ''}
                >
                    <FormattedMessage
                        id='search_bar.files_tab'
                        defaultMessage='Files'
                    />
                </a>
            </div>
            {props.selected === 'files' &&
                <MenuWrapper>
                    <span className='action-icon dots-icon'>
                        {props.selectedFilter !== 'all' && <i className='icon-dot'/>}
                        <i className='icon icon-filter-variant'/>
                    </span>
                    <Menu
                        ariaLabel={'file menu'}
                        openLeft={true}
                    >
                        <Menu.ItemAction
                            ariaLabel={'All file types'}
                            text={'All file types'}
                            onClick={() => props.onFilter('all')}
                            icon={props.selectedFilter === 'all' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Documents'}
                            text={'Documents'}
                            onClick={() => props.onFilter('documents')}
                            icon={props.selectedFilter === 'documents' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Spreadsheets'}
                            text={'Spreadsheets'}
                            onClick={() => props.onFilter('spreadsheets')}
                            icon={props.selectedFilter === 'spreadsheets' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Presentations'}
                            text={'Presentations'}
                            onClick={() => props.onFilter('presentations')}
                            icon={props.selectedFilter === 'presentations' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Code'}
                            text={'Code'}
                            onClick={() => props.onFilter('code')}
                            icon={props.selectedFilter === 'code' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Images'}
                            text={'Images'}
                            onClick={() => props.onFilter('images')}
                            icon={props.selectedFilter === 'images' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Audio'}
                            text={'Audio'}
                            onClick={() => props.onFilter('audio')}
                            icon={props.selectedFilter === 'audio' ? <i className='icon icon-check'/> : null}
                        />
                        <Menu.ItemAction
                            ariaLabel={'Videos'}
                            text={'Videos'}
                            onClick={() => props.onFilter('video')}
                            icon={props.selectedFilter === 'video' ? <i className='icon icon-check'/> : null}
                        />
                    </Menu>
                </MenuWrapper>}
        </div>
    );
}
