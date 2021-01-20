// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import './markdown_image_expand.scss';

type Props = {
    alt: string;
    children: React.ReactNode;
    collapseDisplay: boolean;
};

type State = {
    isExpanded: boolean;
};

const MarkdownImageExpand: React.FC<Props> = ({children, alt, collapseDisplay}: Props) => {
    const [state, setState] = useState<State>({
        isExpanded: !collapseDisplay,
    });
    const {isExpanded} = state;

    const handleToggleButtonClick = () => {
        setState((oldState) => ({...oldState, isExpanded: !oldState.isExpanded}));
    };

    const wrapperClassName = `markdown-image-expand ${isExpanded ? 'markdown-image-expand--expanded' : ''}`;

    return (
        <div className={wrapperClassName}>
            {
                isExpanded ?
                    (
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
                    ) :
                    (
                        <>
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
                        </>
                    )
            }
        </div>
    );
};

export default MarkdownImageExpand;
