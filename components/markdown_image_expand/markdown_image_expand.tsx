// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState, useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import './markdown_image_expand.scss';

export type Props = {
    alt: string;
    children: React.ReactNode;
    isEmbedVisible: boolean;
    postId: string;
};

type State = {
    isExpanded: boolean;
};

const MarkdownImageExpand: React.FC<Props> = ({children, alt, isEmbedVisible}: Props) => {
    const [state, setState] = useState<State>({
        isExpanded: isEmbedVisible,
    });
    const {isExpanded} = state;

    useEffect(() => {
        setState({
            isExpanded: isEmbedVisible,
        });
    }, [setState, isEmbedVisible]);

    const handleToggleButtonClick = () => {
        setState((oldState) => ({...oldState, isExpanded: !oldState.isExpanded}));
    };

    const wrapperClassName = `markdown-image-expand ${isExpanded ? 'markdown-image-expand--expanded' : ''}`;

    return (
        <div className={wrapperClassName}>
            <CSSTransition
                in={isExpanded}
                timeout={200}
                mountOnEnter={true}
                unmountOnExit={true}
                classNames='markdown-image-expand__expanded-view'
            >
                <div>
                    <button
                        className='markdown-image-expand__collapse-button'
                        type='button'
                        onClick={handleToggleButtonClick}
                    >
                        <span className='icon icon-menu-down'/>
                    </button>
                    {children}
                </div>
            </CSSTransition>

            <CSSTransition
                in={!isExpanded}
                timeout={200}
                mountOnEnter={true}
                unmountOnExit={true}
                classNames='markdown-image-expand__collapsed-view'
            >
                <div>
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
                </div>
            </CSSTransition>
        </div>
    );
};

export default MarkdownImageExpand;
