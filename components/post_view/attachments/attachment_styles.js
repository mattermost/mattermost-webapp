import styled from 'styled-components';

import {changeOpacity} from 'utils/utils';

export const Attachment = styled.div`
    position: relative;
    margin-left: -20px;
    max-width: 800px;
`;
export const AttachmentContent = styled.div`
    border-radius: 4px;
    border-style: solid;
    border-width: 1px;
    margin: 5px 0 5px 20px;
    padding: 15px 15px 15px 5px;
    background: ${(props) => props.theme.centerChannelBg};
    border-color: ${(props) => changeOpacity(props.theme.centerChannelColor, 0.3)};
`;
export const ImageThumbnail = styled.img`
    max-width: 80px;
    height: auto;
    max-height: 80px;
`;

export const RemovePreviewButton = styled.button`
    opacity: 0.4;
    background: transparent;
    border: none;
    color: inherit;
    font-size: 21px;
    font-weight: 500;
    height: 20px;
    left: -7px;
    top: 8px;
    line-height: 20px;
    outline: none;
    padding: 0;
    position: absolute;
    text-align: center;
    text-decoration: none;
    text-shadow: none;
    visibility: hidden;
    width: 20px;
    z-index: 5;

    span {
        font-family: 'Open Sans', sans-serif;
        line-height: 10px;
    }
    &:hover {
        opacity: 0.9;
    }
    ${Attachment}:hover & {
        visibility: visible;
    }
`;
