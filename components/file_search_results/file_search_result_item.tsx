// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedTime} from 'react-intl';

import {FileInfo} from 'mattermost-redux/types/files';

import {getFileType, fileSizeToString} from 'utils/utils';
import {browserHistory} from 'utils/browser_history';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import DotsHorizontalIcon from 'components/widgets/icons/dots_horizontal';

import './file_search_result_item.scss';

type Props = {
    fileInfo: FileInfo
};

export default class FileSearchResultItem extends React.PureComponent<Props> {
    private jumpToConv = () => {
        browserHistory.push(`/${this.props.fileInfo.team_name}/pl/${this.props.fileInfo.post_id}`);
    }

    public render(): React.ReactNode {
        const {fileInfo} = this.props;
        return (
            <div className='FileSearchResultItem'>
                <div className={`file-icon ${getFileType(fileInfo.extension)}`}/>
                <div className='fileData'>
                    <div className='fileDataName'>{fileInfo.name}</div>
                    <div className='fileMetadata'>
                        <span>{fileSizeToString(fileInfo.size)}</span>
                        <span>{' • '}</span>
                        <FormattedTime
                            value={fileInfo.create_at}
                            hour='2-digit'
                            minute='2-digit'
                        />
                    </div>
                </div>
                <MenuWrapper>
                    <span className='action-icon dots-icon'>
                        <DotsHorizontalIcon/>
                    </span>
                    <Menu
                        ariaLabel={'file menu'}
                        openLeft={true}
                    >
                        <Menu.ItemAction
                            onClick={this.jumpToConv}
                            ariaLabel={'Open in channel'}
                            text={'Open in channel'}
                        />
                        <Menu.ItemAction
                            onClick={() => alert('Copy link')}
                            ariaLabel={'Copy link'}
                            text={'Copy link'}
                        />
                    </Menu>
                </MenuWrapper>
                <a
                    className='action-icon download-icon'
                    href={`/api/v4/files/${fileInfo.id}?download=1`}
                >
                    <i className='icon icon-download-outline'/>
                </a>
            </div>
        );
    }
}
