import { useEffect } from "@storybook/react/node_modules/@storybook/addons";
import { setGlobalItem } from "actions/storage";
import { FilePreviewInfo } from "components/file_preview/file_preview";
import type { TextboxClass } from "components/textbox";
import { ServerError } from "mattermost-redux/types/errors";
import { FileInfo } from "mattermost-redux/types/files";
import { sortFileInfos } from "mattermost-redux/utils/file_utils";
import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentLocale } from "selectors/i18n";
import { getPostDraft } from "selectors/rhs";
import { GlobalState } from "types/store";
import { PostDraft } from "types/store/rhs";
import { StoragePrefixes } from "utils/constants";
import {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import Input from './input'
import Controls from "./controls";

type Props = {
    channelId: string;
    rootId?: string;
    draft: PostDraft;
    focusTextbox: () => void;
    scrollToBottom?: () => void;

    textboxRef: React.RefObject<TextboxClass>;
    updateDraft: (newDraft: PostDraft, cId: string, rId?: string, inmediate?: boolean) => false;
    getDraftById: (cId: string, rId?: string) => PostDraft;
    setServerError: (err: ServerError|null) => void;
    serverError: ServerError|null;
}

const FileUploadHandler = ({
    channelId,
    rootId,
    draft,
    focusTextbox,
    scrollToBottom,
    updateDraft,
    getDraftById,
    setServerError,
    serverError,
    
    textboxRef,
}: Props) => {
    const fileCount = draft.fileInfos.length + draft.uploadsInProgress.length;
    
    const locale = useSelector<GlobalState, string>((state) => getCurrentLocale(state));
    const [uploadsProgressPercent, setuploadsProgressPercent] = useState<{[id: string]: FilePreviewInfo}>({})
    const fileUploadRef = useRef<FileUploadClass>(null);

    useEffect(() => {
        if (rootId && serverError && scrollToBottom) {
            scrollToBottom();
        }
    }, [serverError])

    const handleUploadStart = (clientIds: string[], channelId: string) => {
        const uploadsInProgress = [
            ...draft.uploadsInProgress,
            ...clientIds,
        ];

        const newDraft = {
            ...draft,
            uploadsInProgress,
        };

        updateDraft(newDraft, channelId, rootId, true)

        // this is a bit redundant with the code that sets focus when the file input is clicked,
        // but this also resets the focus after a drag and drop
        focusTextbox();
    }

    const handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string, cId: string, rId?: string) => {
        const fileDraft = getDraftById(cId, rId)
        const uploadsInProgress = [...fileDraft.uploadsInProgress];
        const newFileInfos = sortFileInfos([...fileDraft.fileInfos, ...fileInfos], locale);

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            const index = uploadsInProgress.indexOf(clientIds[i]);

            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }
        }

        const modifiedDraft = {
            ...fileDraft,
            fileInfos: newFileInfos,
            uploadsInProgress,
        };
        updateDraft(modifiedDraft, cId, rId, true)

        // if (this.props.rootId === rootId) {
        //     this.setState({draft: modifiedDraft});
        // }
    }

    const handleUploadError = (err: string | ServerError | null, clientId?: string, cId?: string, rId?: string) => {
        if (clientId != null && cId != null) {
            const fileDraft = {...getDraftById(cId, rId)};
            const uploadsInProgress = [...fileDraft.uploadsInProgress];
            const index = fileDraft.uploadsInProgress.indexOf(clientId);
            if (index !== -1) {
                uploadsInProgress.splice(index, 1);
            }

            const modifiedDraft = {
                ...fileDraft,
                uploadsInProgress,
            };

            updateDraft(modifiedDraft, cId, rId, true)

        }

        let serverError = err;
        if (typeof serverError === 'string') {
            serverError = new Error(serverError);
        }

        setServerError(serverError);
    }

    const handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        const newUploadsProgressPercent = {...uploadsProgressPercent, [filePreviewInfo.clientId]: filePreviewInfo};
        setuploadsProgressPercent(newUploadsProgressPercent);
    }

    const handleFileUploadChange = () => {
        focusTextbox();
    }

    const getFileUploadTarget = () => {
        return textboxRef.current
    }
    
    const removePreview = (id: string) => {
        const newDraft = {...draft};
        const fileInfos = [...newDraft.fileInfos];
        const uploadsInProgress = [...newDraft.uploadsInProgress];

        // Clear previous errors
        handleUploadError(null);

        // id can either be the id of an uploaded file or the client id of an in progress upload
        let index = fileInfos.findIndex((info) => info.id === id);
        if (index === -1) {
            index = uploadsInProgress.indexOf(id);

            if (index !== -1) {
                uploadsInProgress.splice(index, 1);

                if (fileUploadRef.current) {
                    fileUploadRef.current.cancelUpload(id);
                }
            }
        } else {
            fileInfos.splice(index, 1);
        }

        const modifiedDraft = {
            ...draft,
            fileInfos,
            uploadsInProgress,
        };

        const draftId = rootId || channelId
        updateDraft(newDraft, channelId, rootId, true)


        handleFileUploadChange();
    }

    const fileUploadProps = useMemo(() => {
        return {
            fileCount,
            fileUploadRef,
            handleUploadStart,
            handleFileUploadComplete,
            handleUploadProgress,
            handleFileUploadChange,
            handleUploadError,
            getFileUploadTarget,
        }
    }, [
        fileCount,
        fileUploadRef,
        handleUploadStart,
        handleFileUploadComplete,
        handleUploadProgress,
        handleFileUploadChange,
        handleUploadError,
        getFileUploadTarget,
    ])

    return (
        <Input
            channelId={channelId}
            fileUploadProps={fileUploadProps}
            textboxRef={textboxRef}
            caretPosition={caretPosition}
            emitTypingEvent={emitTypingEvent}
            fileInfos={draft.fileInfos}
            handleBlur={handleBlur}
        />
    )
}
