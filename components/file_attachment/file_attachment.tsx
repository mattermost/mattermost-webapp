// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import classNames from 'classnames';

import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from 'mattermost-redux/types/files';

import OverlayTrigger from 'components/overlay_trigger';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import GetPublicModal from 'components/get_public_link_modal';

import {Constants, FileTypes, ModalIdentifiers} from 'utils/constants';
import {trimFilename} from 'utils/file_utils';
import {
    fileSizeToString,
    getFileType,
    loadImage,
    localizeMessage,
} from 'utils/utils.jsx';

import FilenameOverlay from './filename_overlay';
import FileThumbnail from './file_thumbnail';

import {PropsFromRedux} from './index';

interface Props extends PropsFromRedux{

    /*
    * File detailed information
    */
    fileInfo: FileInfo;

    /*
    * The index of this attachment preview in the parent FileAttachmentList
    */
    index: number;

    /*
    * Handler for when the thumbnail is clicked passed the index above
    */
    handleImageClick?: (index: number) => void;

    /*
    * Display in compact format
    */
    compactDisplay?: boolean;
    handleFileDropdownOpened?: (open: boolean) => void;
}

interface State {
    loaded: boolean;
    keepOpen: boolean;
    openUp: boolean;
    fileInfo: FileInfo;
}

export default class FileAttachment extends React.PureComponent<Props, State> {
    mounted = false;
    private readonly buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            loaded: getFileType(props.fileInfo.extension) !== FileTypes.IMAGE,
            fileInfo: props.fileInfo,
            keepOpen: false,
            openUp: false,
        };
        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        this.mounted = true;
        this.loadFiles();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.fileInfo.id !== prevState.fileInfo.id) {
            const extension = nextProps.fileInfo.extension;

            return {
                loaded: getFileType(extension) !== FileTypes.IMAGE && !(nextProps.enableSVGs && extension === FileTypes.SVG),
                fileInfo: nextProps.fileInfo,
            };
        }

        return null;
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.state.loaded && this.props.fileInfo.id !== prevProps.fileInfo.id) {
            this.loadFiles();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    loadFiles = () => {
        const fileInfo = this.props.fileInfo;
        const fileType = getFileType(fileInfo.extension);

        if (fileType === FileTypes.IMAGE) {
            const thumbnailUrl = getFileThumbnailUrl(fileInfo.id);

            loadImage(thumbnailUrl, this.handleImageLoaded);
        } else if (fileInfo.extension === FileTypes.SVG && this.props.enableSVGs) {
            loadImage(getFileUrl(fileInfo.id), this.handleImageLoaded);
        }
    }

    handleImageLoaded = () => {
        if (this.mounted) {
            this.setState({
                loaded: true,
            });
        }
    }

    onAttachmentClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();

        if ('blur' in e.target) {
            (e.target as HTMLElement).blur();
        }

        if (this.props.handleImageClick) {
            this.props.handleImageClick(this.props.index);
        }
    }

    refCallback = (menuRef: Menu) => {
        if (menuRef) {
            const anchorRect = this.buttonRef.current?.getBoundingClientRect();
            let y;
            if (typeof anchorRect?.y === 'undefined') {
                y = typeof anchorRect?.top === 'undefined' ? 0 : anchorRect?.top;
            } else {
                y = anchorRect?.y;
            }
            const windowHeight = window.innerHeight;

            const totalSpace = windowHeight - 80;
            const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
            const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

            this.setState({
                openUp: (spaceOnTop > spaceOnBottom),
            });
        }
    }

    private handleDropdownOpened = (open: boolean) => {
        this.props.handleFileDropdownOpened?.(open);
        this.setState({keepOpen: open});
    }

    handleGetPublicLink = () => {
        this.props.actions.openModal({modalId: ModalIdentifiers.GET_PUBLIC_LINK_MODAL,
            dialogType: GetPublicModal,
            dialogProps: {
                fileId: this.props.fileInfo.id,
            },
        });
    }

    private renderFileMenuItems = () => {
        const {enablePublicLink, fileInfo, pluginMenuItems} = this.props;

        let divider;
        const defaultItems = [];
        if (enablePublicLink) {
            defaultItems.push(
                <Menu.ItemAction
                    data-title='Public Image'
                    onClick={this.handleGetPublicLink}
                    ariaLabel={localizeMessage('view_image_popover.publicLink', 'Get a public link')}
                    text={localizeMessage('view_image_popover.publicLink', 'Get a public link')}
                />,
            );
        }

        const pluginItems = pluginMenuItems?.filter((item) => item?.match(fileInfo)).map((item) => {
            return (
                <Menu.ItemAction
                    id={item.id + '_pluginmenuitem'}
                    key={item.id + '_pluginmenuitem'}
                    onClick={() => item?.action(fileInfo)}
                    text={item.text}
                />
            );
        });

        const isMenuVisible = defaultItems?.length || pluginItems?.length;
        if (!isMenuVisible) {
            return null;
        }

        const isDividerVisible = defaultItems?.length && pluginItems?.length;
        if (isDividerVisible) {
            divider = (
                <li
                    id={`divider_file_${fileInfo.id}_plugins`}
                    className='MenuItem__divider'
                    role='menuitem'
                />
            );
        }

        const tooltip = (
            <Tooltip id='file-name__tooltip'>
                {localizeMessage('file_search_result_item.more_actions', 'More Actions')}
            </Tooltip>
        );

        return (
            <MenuWrapper
                onToggle={this.handleDropdownOpened}
                stopPropagationOnToggle={true}
            >
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={1000}
                    placement='top'
                    overlay={tooltip}
                >
                    <button
                        ref={this.buttonRef}
                        id={`file_action_button_${this.props.fileInfo.id}`}
                        aria-label={localizeMessage('file_search_result_item.more_actions', 'More Actions').toLowerCase()}
                        className={classNames(
                            'file-dropdown-icon', 'dots-icon',
                            {'a11y--active': this.state.keepOpen},
                        )}
                        aria-expanded={this.state.keepOpen}
                    >
                        <i className='icon icon-dots-vertical'/>
                    </button>
                </OverlayTrigger>
                <Menu
                    id={`file_dropdown_${this.props.fileInfo.id}`}
                    ariaLabel={'file menu'}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ref={this.refCallback}
                >
                    {defaultItems}
                    {divider}
                    {pluginItems}
                </Menu>
            </MenuWrapper>
        );
    }

    render() {
        const {
            compactDisplay,
            fileInfo,
        } = this.props;

        const trimmedFilename = trimFilename(fileInfo.name);
        let fileThumbnail;
        let fileDetail;
        let fileActions;
        const ariaLabelImage = `${localizeMessage('file_attachment.thumbnail', 'file thumbnail')} ${fileInfo.name}`.toLowerCase();

        if (!compactDisplay) {
            fileThumbnail = (
                <a
                    aria-label={ariaLabelImage}
                    className='post-image__thumbnail'
                    href='#'
                    onClick={this.onAttachmentClick}
                >
                    {this.state.loaded ? (
                        <FileThumbnail fileInfo={fileInfo}/>
                    ) : (
                        <div className='post-image__load'/>
                    )}
                </a>
            );

            fileDetail = (
                <div
                    className='post-image__detail_wrapper'
                    onClick={this.onAttachmentClick}
                >
                    <div className='post-image__detail'>
                        <span className={'post-image__name'}>
                            {trimmedFilename}
                        </span>
                        <span className='post-image__type'>{fileInfo.extension.toUpperCase()}</span>
                        <span className='post-image__size'>{fileSizeToString(fileInfo.size)}</span>
                    </div>
                </div>
            );

            fileActions = this.renderFileMenuItems();
        }

        let filenameOverlay;
        if (this.props.canDownloadFiles) {
            filenameOverlay = (
                <FilenameOverlay
                    fileInfo={fileInfo}
                    compactDisplay={compactDisplay}
                    canDownload={this.props.canDownloadFiles}
                    handleImageClick={this.onAttachmentClick}
                    iconClass={'post-image__download'}
                >
                    <i className='icon icon-download-outline'/>
                </FilenameOverlay>
            );
        }

        return (
            <div
                className={
                    classNames([
                        'post-image__column',
                        {'keep-open': this.state.keepOpen},
                    ])
                }
            >
                {fileThumbnail}
                <div className='post-image__details'>
                    {fileDetail}
                    {fileActions}
                    {filenameOverlay}
                </div>
            </div>
        );
    }
}
