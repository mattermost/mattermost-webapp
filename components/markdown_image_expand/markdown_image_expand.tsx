import React, { useState } from 'react';
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
  const { isExpanded } = state;

  const handleToggleButtonClick = () => {
    setState((oldState) => ({...oldState, isExpanded: !oldState.isExpanded}));
  };

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
              <button className="markdown-image-expand__expand-button" type="button" onClick={handleToggleButtonClick}>
                <span className="fa fa-caret-right markdown-image-expand__expand-icon"></span>

                <span className="markdown-image-expand__alt-text">
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