import React, { memo } from "react";
import styled from "styled-components";

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
}

// const ToggleFormattingBarContainer = styled.div`
//     border: 1px solid gray;
//     padding: 5px;
//     cursor: pointer;

//     &:hover {
//         background: #888;
//     }
// `;

export const ToggleFormattingBar: React.ComponentType<ToggleFormattingBarProps> =
    memo(({ onClick }) => {
        return (
            <div>
                <button
                    type="button"
                    id="fileUploadButton"
                    onClick={onClick}
                    className="style--none post-action icon icon--attachment"
                >
                    Aa
                </button>
            </div>
        );
    });
