// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import './markdown_image_expand.scss';

export type Props = {
    alt: string;
    children: React.ReactNode;
    isEmbedVisible: boolean;
    postId: string;
    actions: {
        toggleEmbedVisibility: (postId: string) => void;
    };
};

const MarkdownImageExpand: React.FC<Props> = ({children, alt, isEmbedVisible, postId, actions}: Props) => {
    const {toggleEmbedVisibility} = actions;

    const handleToggleButtonClick = () => {
        toggleEmbedVisibility(postId);
    };

    const wrapperClassName = `markdown-image-expand ${isEmbedVisible ? 'markdown-image-expand--expanded' : ''}`;

    return (
        <div className={wrapperClassName}>
            {
                isEmbedVisible &&
                <>
                    <button
                        className='markdown-image-expand__collapse-button'
                        type='button'
                        onClick={handleToggleButtonClick}
                    >
                        <span className='icon icon-menu-down'/>
                    </button>
                    {children}
                </>
            }

            {
                !isEmbedVisible &&
                <button
                    className='markdown-image-expand__expand-button'
                    type='button'
                    onClick={handleToggleButtonClick}
                >
                    <span className='icon icon-menu-right markdown-image-expand__expand-icon'/>

                    <span className='markdown-image-expand__alt-text'>
                        {alt}
                    </span>
                </button>
            }
        </div>
    );
};

export default MarkdownImageExpand;
