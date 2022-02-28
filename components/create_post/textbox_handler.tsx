import { useEffect, useState } from "@storybook/react/node_modules/@storybook/addons";
import { Preferences } from "mattermost-redux/constants";
import { getBool } from "mattermost-redux/selectors/entities/preferences";
import { ServerError } from "mattermost-redux/types/errors";
import { GlobalState } from "mattermost-redux/types/store";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { PostDraft } from "types/store/rhs";
import { isErrorInvalidSlashCommand, postMessageOnKeyPress } from "utils/post_utils";

type Props = {
    channelId: string;
    rootId?: string;
    serverError: ServerError|null;
    draft: PostDraft,
    setServerError: (err: ServerError|null) => void;
    updateDraft: (newDraft: PostDraft, cId: string, rId?: string, inmediate?: boolean) => false;
}

type TextboxProps = {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const TextboxHandler = ({
    channelId,
    rootId,
    serverError,
    draft,
    setServerError,
    updateDraft,
}:Props) => {
    const [message, setMessage] = useState(draft.message);
    const ctrlSend = useSelector<GlobalState, boolean>((state) => getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'))
    const codeBlockOnCtrlEnter = useSelector<GlobalState, boolean>((state) => getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true));
    const lastChannelSwitchAt = useRef(Date.now());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;
        setMessage(message);
        
        // if (isErrorInvalidSlashCommand(serverError)) {
        //     serverError = null;
        // }

        const modifiedDraft = {
            ...draft,
            message,
        };
        updateDraft(modifiedDraft, channelId, rootId)
    }

    postMsgKeyPress = (e: React.KeyboardEvent<Element>) => {
        const {
            allowSending,
            withClosedCodeBlock,
            ignoreKeyPress,
            message: newMessage,
        } = postMessageOnKeyPress(
            e,
            message,
            Boolean(ctrlSend),
            Boolean(codeBlockOnCtrlEnter),
            rootId ? 0 : Date.now(),
            rootId ? 0 : lastChannelSwitchAt.current,
            caretPosition,
        ) as {
            allowSending: boolean;
            withClosedCodeBlock?: boolean;
            ignoreKeyPress?: boolean;
            message?: string;
        };

        if (!rootId && ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending) {
            if (e.persist) {
                e.persist();
            }
            if (textboxRef.current) {
                textboxRef.current.blur();
            }

            if (withClosedCodeBlock && newMessage) {
                this.setState({message}, () => this.handleSubmit(e));
            } else {
                handleSubmit(e);
            }

            setShowPreview(false);
        }

        emitTypingEvent();
    }

    useEffect(() => {
        if (draft.message != message) {
            setMessage(draft.message)
        }
    }, [draft.message])

}
