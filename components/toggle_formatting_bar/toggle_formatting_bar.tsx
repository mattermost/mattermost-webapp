import React, { memo } from "react";
import styled from "styled-components";

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
}

const ToggleFormattingBarContainer = styled.div`
    border: 1px solid gray;
    padding: 5px;
    cursor: pointer;

    &:hover {
        background: #888;
    }
`;

export const ToggleFormattingBar: React.ComponentType<ToggleFormattingBarProps> =
    memo(({ onClick }) => {
        return (
            <ToggleFormattingBarContainer onClick={onClick}>
                Aa
            </ToggleFormattingBarContainer>
        );
    });
