// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, memo} from 'react';
import classNames from 'classnames';
import {CloseIcon, MenuDownIcon, MenuRightIcon} from '@mattermost/compass-icons/components';

import {useIntl} from 'react-intl';

import {
    OpenGraphMetadata,
    OpenGraphMetadataImage,
    Post,
    PostImage,
} from 'mattermost-redux/types/posts';

import AutoHeightSwitcher from 'components/common/auto_height_switcher';
import {PostTypes} from 'utils/constants';
import {isSystemMessage} from 'utils/post_utils';
import {makeUrlSafe} from 'utils/url';

import {getNearestPoint} from './get_nearest_point';

import './post_attachment_opengraph.scss';

const DIMENSIONS_NEAREST_POINT_IMAGE = {
    height: 80,
    width: 80,
};

const LARGE_IMAGE_RATIO = 4 / 3;
const LARGE_IMAGE_WIDTH = 150;

export type Props = {
    postId: string;
    link: string;
    currentUserId?: string;
    post: Post;
    openGraphData?: OpenGraphMetadata;
    enableLinkPreviews?: boolean;
    previewEnabled?: boolean;
    isEmbedVisible?: boolean;
    toggleEmbedVisibility: () => void;
    actions: {
        editPost: (post: { id: string; props: Record<string, any> }) => void;
    };
    isInPermalink?: boolean;
};

type ImageData = {
    url?: string;
    secure_url?: string;
    type?: string;
    width: number;
    height: number;
    format: string;
    frameCount: number;
}

export function getBestImage(openGraphData?: OpenGraphMetadata, imagesMetadata?: Record<string, PostImage>) {
    if (!openGraphData?.images?.length) {
        return null;
    }

    // Get the dimensions from the post metadata if they weren't provided by the website as part of the OpenGraph data
    const images = openGraphData.images.map((image: OpenGraphMetadataImage) => {
        const imageUrl = image.secure_url || image.url;

        return {
            ...image,
            height: image.height || imagesMetadata?.[imageUrl].height || -1,
            width: image.width || imagesMetadata?.[imageUrl].width || -1,
            format: image.format || image.type?.split('/')[1] || image.type || '',
            frameCount: 0,
        };
    });

    return getNearestPoint<ImageData>(DIMENSIONS_NEAREST_POINT_IMAGE, images);
}

export const getIsLargeImage = (data: ImageData) => {
    const {height, width} = data;

    return width >= LARGE_IMAGE_WIDTH && (width / height) >= LARGE_IMAGE_RATIO;
};

const PostAttachmentOpenGraph = ({openGraphData, post, actions, link, ...rest}: Props) => {
    const [imageUrl, setImageUrl] = useState<string>();
    const [isLargeImage, setIsLargeImage] = useState<boolean>(false);
    const [showImagePreview, setShowImagePreview] = useState<boolean>(true);
    const [previewRemoved, setPreviewRemoved] = useState<boolean>(post?.props?.[PostTypes.REMOVE_LINK_PREVIEW] === 'true');

    useEffect(() => {
        const bestImageData = getBestImage(openGraphData, post.metadata.images);
        if (bestImageData) {
            setImageUrl(bestImageData.secure_url || bestImageData.url);
            setIsLargeImage(getIsLargeImage(bestImageData));
        }
    }, [openGraphData, post.metadata.images]);

    useEffect(() => setPreviewRemoved(post?.props?.[PostTypes.REMOVE_LINK_PREVIEW] === 'true'), [post]);

    const handleRemovePreview = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // prevent the button-click to trigger visiting the link
        e.stopPropagation();
        const props = Object.assign({}, post.props);
        props[PostTypes.REMOVE_LINK_PREVIEW] = 'true';

        const patchedPost = {
            id: post.id,
            props,
        };

        return actions.editPost(patchedPost);
    };

    const toggleImagePreview = (e: React.MouseEvent<HTMLButtonElement>, collapse: boolean) => {
        e.preventDefault();

        // prevent the button-click to trigger visiting the link
        e.stopPropagation();
        setShowImagePreview(collapse);
    };

    const doNotRender = !rest.previewEnabled ||
        !rest.enableLinkPreviews ||
        !post ||
        !openGraphData ||
        previewRemoved ||
        isSystemMessage(post);
    const safeLink = makeUrlSafe(openGraphData?.url || link);

    return doNotRender ? null : (
        <a
            className='PostAttachmenOpenGraph'
            role='link'
            href={safeLink}
            target='_blank'
            rel='noopener noreferrer'
            title={openGraphData?.title || openGraphData?.url || link}
        >
            {rest.currentUserId === post.user_id && !rest.isInPermalink && (
                <button
                    type='button'
                    className='remove-button style--none'
                    aria-label='Remove'
                    onClick={handleRemovePreview}
                    data-testid='removeLinkPreviewButton'
                >
                    <CloseIcon
                        size={14}
                        color={'rgba(var(--center-channel-color-rgb), 0.56)'}
                    />
                </button>
            )}
            <PostAttachmentOpenGraphBody
                isInPermalink={rest.isInPermalink}
                siteName={openGraphData?.site_name}
                title={openGraphData?.title || openGraphData?.url || link}
                description={openGraphData?.description}
            />
            <PostAttachmenOpenGraphImage
                src={imageUrl}
                title={openGraphData?.title}
                isInPermalink={rest.isInPermalink}
                large={isLargeImage}
                collapsed={!showImagePreview}
                toggleImagePreviewHandler={toggleImagePreview}
            />
        </a>
    );
};

type BodyProps = {
    title: string;
    isInPermalink?: boolean;
    siteName?: string;
    description?: string;
}

const PostAttachmentOpenGraphBody = memo(({title, isInPermalink, siteName = '', description = ''}: BodyProps) => {
    return (
        <div className={classNames('PostAttachmenOpenGraph__body', {inPermalink: isInPermalink})}>
            {(!isInPermalink && siteName) && <span className='sitename'>{siteName}</span>}
            <span className='title'>{title}</span>
            {description && <span className='description'>{description}</span>}
        </div>
    );
});

type ImageProps = {
    src?: string;
    title?: string;
    isInPermalink?: boolean;
    large: boolean;
    collapsed: boolean;
    toggleImagePreviewHandler: (e: React.MouseEvent<HTMLButtonElement>, collapse: boolean) => void;
}

const PostAttachmenOpenGraphImage = memo(({large, collapsed, isInPermalink, toggleImagePreviewHandler, src = '', title = ''}: ImageProps) => {
    const {formatMessage} = useIntl();

    if (!src || isInPermalink) {
        return null;
    }

    const collapsedLabel = formatMessage({id: 'link_preview.image_preview', defaultMessage: 'Show image preview'});

    const imageCollapseButton = (
        <button
            className='preview-toggle style--none'
            onClick={(e) => toggleImagePreviewHandler(e, collapsed)}
        >
            {collapsed ? (
                <>
                    <MenuRightIcon
                        size={18}
                        color='currentColor'
                    />
                    {collapsedLabel}
                </>
            ) : (
                <MenuDownIcon
                    size={18}
                    color='currentColor'
                />
            )}
        </button>
    );

    const image = (
        <>
            {large && imageCollapseButton}
            <figure>
                <img
                    src={src}
                    alt={title}
                />
            </figure>
        </>
    );

    return (
        <div className={classNames('PostAttachmenOpenGraph__image', {large, collapsed})}>
            {large ? (
                <AutoHeightSwitcher
                    showSlot={collapsed ? 1 : 2}
                    slot1={imageCollapseButton}
                    slot2={image}
                />
            ) : image}
        </div>
    );
});

export default memo(PostAttachmentOpenGraph);
