import { PostImage } from 'mattermost-redux/types/posts';
import React, { useState } from 'react';
import Constants from 'utils/constants';
import './markdown_image_expand.scss';

type Props = {
  imageMetadata: PostImage;
  alt: string;
  children: React.ReactNode;
  collapseDisplay: boolean;
};

type State = {
  isExpanded: boolean;
};

const MarkdownImageExpand: React.FC<Props> = ({children, imageMetadata, alt, collapseDisplay}: Props) => {
  const [state, setState] = useState<State>({
    isExpanded: !collapseDisplay,
  });
  const { isExpanded } = state;

  const handleToggleButtonClick = () => {
    setState((oldState) => ({...oldState, isExpanded: !oldState.isExpanded}));
  };

  const { height } = imageMetadata;
  if (height < Constants.MAX_INLINE_IMAGE_HEIGHT) {
    return <>{children}</>;
  }

  const wrapperClassName = `markdown-image-expand ${isExpanded ? 'markdown-image-expand--expanded' : ''}`;

  return (
    <div className={wrapperClassName}>
      {
        isExpanded 
          ? (
            <>
              <button className="markdown-image-expand__collapse-button" type="button" onClick={handleToggleButtonClick}>
                <span className="fa fa-caret-down"></span>
              </button>
              {children}
            </>
          )
          : (
            <>
              <button className="style--none markdown-image-expand__expand-button" type="button" onClick={handleToggleButtonClick}>
                <span className="fa fa-caret-right"></span>
              </button>
              <span className="markdown-image-expand__alt-text">
                {alt}
              </span>
            </>
          )
      }
    </div>
  );
};

export default MarkdownImageExpand;