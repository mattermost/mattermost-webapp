// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {FileInfo} from 'mattermost-redux/types/files';

import {fileSizeToString, copyToClipboard, localizeMessage} from 'utils/utils';
import {browserHistory} from 'utils/browser_history';
import {getSiteURL} from 'utils/url';
import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import Menu from 'components/widgets/menu/menu';
import Badge from 'components/widgets/badges/badge';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import FileThumbnail from 'components/file_attachment/file_thumbnail';
import Timestamp, {RelativeRanges} from 'components/timestamp';
import ViewImageModal from 'components/view_image';

import './file_search_result_item.scss';

type Props = {
    fileInfo: FileInfo;
    channelDisplayName: string;
    channelType: string;
    teamName: string;
};

type State = {
    keepOpen: boolean;
    showPreview: boolean;
}

const FILE_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

export default class FileSearchResultItem extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {keepOpen: false, showPreview: false};
    }

    private jumpToConv = (e: MouseEvent) => {
        e.stopPropagation();
        browserHistory.push(`/${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    }

    private copyLink = () => {
        copyToClipboard(`${getSiteURL()}/${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    }

    private stopPropagation = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
    }

    private keepOpen = (open: boolean) => {
        this.setState({keepOpen: open});
    }

    public render(): React.ReactNode {
        const {fileInfo, channelDisplayName, channelType} = this.props;
        let channelName: React.ReactNode = channelDisplayName;
        if (channelType === Constants.DM_CHANNEL) {
            channelName = (
                <FormattedMessage
                    id='search_item.file_badge.direct_message'
                    defaultMessage='Direct Message'
                />
            );
        } else if (channelType === Constants.GM_CHANNEL) {
            channelName = (
                <FormattedMessage
                    id='search_item.file_badge.group_message'
                    defaultMessage='Group Message'
                />
            );
        }

        return (
            <div
                data-testid='search-item-container'
                className='search-item__container'
            >
                <button
                    className={'FileSearchResultItem' + (this.state.keepOpen ? ' keep-open' : '')}
                    onClick={() => this.setState({showPreview: true})}
                >
                    <FileThumbnail fileInfo={fileInfo}/>
                    <div className='fileData'>
                        <div className='fileDataName'>{fileInfo.name}</div>
                        <div className='fileMetadata'>
                            {channelName && <Badge className='file-search-channel-name'>{channelName}</Badge>}
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
                        <MenuWrapper
                            onToggle={this.keepOpen}
                            stopPropagationOnToggle={true}
                        >
                            <a
                                href='#'
                                className='action-icon dots-icon'
                            >
                                <i className='icon icon-dots-vertical'/>
                            </a>
                            <Menu
                                ariaLabel={'file menu'}
                                openLeft={true}
                            >
                                <Menu.ItemAction
                                    onClick={this.jumpToConv}
                                    ariaLabel={localizeMessage('file_search_result_item.open_in_channel', 'Open in channel')}
                                    text={localizeMessage('file_search_result_item.open_in_channel', 'Open in channel')}
                                />
                                <Menu.ItemAction
                                    onClick={this.copyLink}
                                    ariaLabel={localizeMessage('file_search_result_item.copy_link', 'Copy link')}
                                    text={localizeMessage('file_search_result_item.copy_link', 'Copy link')}
                                />
                            </Menu>
                        </MenuWrapper>
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
                </button>
                <ViewImageModal
                    show={this.state.showPreview}
                    onModalDismissed={() => this.setState({showPreview: false})}
                    startIndex={0}
                    fileInfos={[this.props.fileInfo]}
                    postId={this.props.fileInfo.post_id}
                />
            </div>
        );
    }
}
