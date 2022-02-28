import { updateDraft as updateDraftInStore } from "actions/views/create_comment";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { getPostDraft } from "selectors/rhs";
import { GlobalState } from "types/store";
import { PostDraft } from "types/store/rhs";
import { StoragePrefixes } from "utils/constants";

type Props = {
    rootId?: string;
    channelId: string;
};

const CreatePostDraftTimeoutMilliseconds = 500;

const DraftHandler = ({
    rootId,
    channelId,
}:Props) => {
    const draft = useSelector<GlobalState, PostDraft>((state) => getPostDraft(
        state,
        rootId ? StoragePrefixes.COMMENT_DRAFT : StoragePrefixes.DRAFT,
        rootId || channelId,
    ));
    const localDrafts = useRef<{[id: string]: PostDraft}>({});
    const saveDraftFrame = useRef(0);

    const updateDraft = (newDraft: PostDraft, cId: string, rId?: string, inmediate = false) => {
        const id = rId || cId;
        const isComment = Boolean(rId);
        localDrafts.current[id] = newDraft;
        if (inmediate) {
            updateDraftInStore(rId || cId, newDraft, isComment);
        } else {
            if (saveDraftFrame.current) {
                clearTimeout(saveDraftFrame.current);
            }
    
            saveDraftFrame.current = window.setTimeout(() => {
                updateDraftInStore(rId || cId, newDraft, isComment);
            }, CreatePostDraftTimeoutMilliseconds);
        }
    }

    const getDraftById = (cId: string, rId?: string) => {
        return localDrafts.current[rId || cId];
    }
}
