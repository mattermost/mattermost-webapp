import styled from 'styled-components';

import {changeOpacity} from 'utils/utils';

export const AttachmentContainer = styled.div`
    position: relative;
    margin: 5px 0 5px -20px;
    padding-left: 20px;
    max-width: 800px;
`;
export const AttachmentContentContainer = styled.div`
    position: relative;
    min-height: 120px;
    border-radius: 4px;
    border-width: ;
    padding: 10px 15px 10px 10px;
    background: ${(props) => props.theme.centerChannelBg};
    border: 1px solid ${(props) => changeOpacity(props.theme.centerChannelColor, 0.3)};
`;
export const AttachmentContentLeft = styled.div`
    min-width:0;
    overflow: hidden;
`;
export const ImageThumbnail = styled.img`
    max-width: 80px;
    height: auto;
    max-height: 80px;
    margin-left:10px;
`;
export const ImageLarge = styled.img`
    border-radius: 3px;
    margin-top: 10px;
    max-height: 200px;
    max-width: 400px;
    width: 100%;
`;
export const AttachmentSiteName = styled.div`
    color: #A3A3A3;
`;
export const AttachmentTitle = styled.h1`
    font-size: 14px;
    font-weight: 600;
    height: 22px;
    line-height: 18px;
    margin: 5px 0;
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
export const AttachmentDescription = styled.div`
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
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
    ${AttachmentContainer}:hover & {
        visibility: visible;
    }
`;
