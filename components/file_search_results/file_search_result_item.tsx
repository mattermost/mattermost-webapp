// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';

import {FileInfo} from 'mattermost-redux/types/files';

import {fileSizeToString, copyToClipboard, localizeMessage} from 'utils/utils';
import {browserHistory} from 'utils/browser_history';

import OverlayTrigger from 'components/overlay_trigger';
import Menu from 'components/widgets/menu/menu';
import Badge from 'components/widgets/badges/badge';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import FileThumbnail from 'components/file_attachment/file_thumbnail';
import Timestamp, {RelativeRanges} from 'components/timestamp';

import './file_search_result_item.scss';

type Props = {
    fileInfo: FileInfo;
    channelDisplayName: string;
    teamName: string;
    onClick: (fileInfo: FileInfo) => void;
};

const FILE_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

export default class FileSearchResultItem extends React.PureComponent<Props> {
    private jumpToConv = (e: MouseEvent) => {
        e.stopPropagation();
        browserHistory.push(`/${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    }

    private copyLink = (e: MouseEvent) => {
        e.stopPropagation();
        copyToClipboard(`${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    }

    private onClickHandler = () => {
        this.props.onClick(this.props.fileInfo);
    }

    private stopPropagation = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
    }

    public render(): React.ReactNode {
        const {fileInfo, channelDisplayName} = this.props;

        return (
            <div
                className='FileSearchResultItem'
                onClick={this.onClickHandler}
            >
                <FileThumbnail fileInfo={fileInfo}/>
                <div className='fileData'>
                    <div className='fileDataName'>{fileInfo.name}</div>
                    <div className='fileMetadata'>
                        {channelDisplayName && <Badge className='file-search-channel-name'>{channelDisplayName}</Badge>}
                        <span>{fileSizeToString(fileInfo.size)}</span>
                        <span>{' • '}</span>
                        <Timestamp
                            value={fileInfo.create_at}
                            ranges={FILE_TOOLTIP_RANGES}
                        />
                    </div>
                </div>
                <OverlayTrigger
                    delayShow={1000}
                    placement='top'
                    overlay={
                        <Tooltip id='file-name__tooltip'>
                            {localizeMessage('file_search_result_item.more_actions', 'More Actions')}
                        </Tooltip>
                    }
                >
                    <div onClick={this.stopPropagation}>
                        <MenuWrapper>
                            <span className='action-icon dots-icon'>
                                <i className='icon icon-dots-vertical'/>
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
                                    onClick={this.copyLink}
                                    ariaLabel={'Copy link'}
                                    text={'Copy link'}
                                />
                            </Menu>
                        </MenuWrapper>
                    </div>
                </OverlayTrigger>
                <OverlayTrigger
                    delayShow={1000}
                    placement='top'
                    overlay={
                        <Tooltip id='file-name__tooltip'>
                            {localizeMessage('file_search_result_item.download', 'Download')}
                        </Tooltip>
                    }
                >
                    <a
                        className='action-icon download-icon'
                        href={`/api/v4/files/${fileInfo.id}?download=1`}
                        onClick={this.stopPropagation}
                    >
                        <i className='icon icon-download-outline'/>
                    </a>
                </OverlayTrigger>
            </div>
        );
    }
}
