// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import SuggestionList, {SuggestionItem} from 'components/suggestion/suggestion_list.jsx';
import {getClosestParent} from 'utils/utils.jsx';

interface InputBounds {
    top: number;
    bottom: number;
    width: number;
}

interface Props {
    open: boolean;
    cleared: boolean;
    inputRef: React.RefObject<any>;
    onLoseVisibility: () => void;
    position?: 'top' | 'bottom';

    onCompleteWord: (term: string, matchedPretext: string[], e?: React.UIEvent<ReactNode>) => boolean;
    onItemHover: (term: string) => void;
    pretext: string;
    matchedPretext: string[];
    items: SuggestionItem[];
    terms: string[];
    selection: string;
    components: Array<React.Component<{item: SuggestionItem}>>;
}

interface State {
    scroll: number;
    modalBounds: {top: number; bottom: number};
    inputBounds: InputBounds;
    open: boolean;
    cleared: boolean;
    position?: 'top' | 'bottom';
}

export default class ModalSuggestionList extends React.PureComponent<Props, State> {
    container: React.RefObject<any>;
    suggestionList: React.RefObject<any>;
    latestHeight: number;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: props.open,
            cleared: props.cleared,
            scroll: 0,
            modalBounds: {top: 0, bottom: 0},
            inputBounds: {top: 0, bottom: 0, width: 0},
            position: props.position,
        };

        this.container = React.createRef();
        this.suggestionList = React.createRef();
        this.latestHeight = 0;
    }

    calculateInputRect(): InputBounds {
        if (this.props.inputRef.current) {
            const rect = this.props.inputRef.current.getInput().getBoundingClientRect();
            return {top: rect.top, bottom: rect.bottom, width: rect.width};
        }
        return {top: 0, bottom: 0, width: 0};
    }

    onModalScroll(e: React.UIEvent<ReactNode>): void {
        const target = e.target as HTMLElement;
        if (this.state.scroll !== target.scrollTop &&
            this.latestHeight !== 0) {
            this.setState({scroll: target.scrollTop});
        }
    }

    componentDidMount(): void {
        if (this.container.current) {
            const modalBodyContainer = getClosestParent(this.container.current, '.modal-body');
            modalBodyContainer.addEventListener('scroll', this.onModalScroll);
        }
        window.addEventListener('resize', this.updateModalBounds);
    }

    componentWillUnmount(): void {
        if (this.container.current) {
            const modalBodyContainer = getClosestParent(this.container.current, '.modal-body');
            modalBodyContainer.removeEventListener('scroll', this.onModalScroll);
        }
        window.removeEventListener('resize', this.updateModalBounds);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (!this.props.open || this.props.cleared) {
            return;
        }

        if (prevProps.open !== this.state.open ||
            prevProps.cleared !== this.state.cleared ||
            prevState.scroll !== this.state.scroll ||
            prevState.modalBounds.top !== this.state.modalBounds.top ||
            prevState.modalBounds.bottom !== this.state.modalBounds.bottom) {
            const newInputBounds = this.updateInputBounds();
            this.updatePosition(newInputBounds);

            if (this.container.current) {
                const modalBodyRect = getClosestParent(this.container.current, '.modal-body').getBoundingClientRect();
                if ((newInputBounds.bottom < modalBodyRect.top) || (newInputBounds.top > modalBodyRect.bottom)) {
                    this.props.onLoseVisibility();
                    return;
                }
            }

            this.updateModalBounds();
        }
    }

    getChildHeight(): number {
        if (!this.container.current) {
            return 0;
        }

        const listElement = this.suggestionList.current?.getContent()?.[0];
        if (!listElement) {
            return 0;
        }

        return listElement.getBoundingClientRect().height;
    }

    updateInputBounds(): InputBounds {
        const inputBounds = this.calculateInputRect();
        if (inputBounds.top !== this.state.inputBounds.top ||
            inputBounds.bottom !== this.state.inputBounds.bottom ||
            inputBounds.width !== this.state.inputBounds.width) {
            this.setState({inputBounds});
        }
        return inputBounds;
    }

    updatePosition(newInputBounds: InputBounds): void {
        let inputBounds = newInputBounds;
        if (!newInputBounds) {
            inputBounds = this.state.inputBounds;
        }

        if (!this.container.current) {
            return;
        }

        this.latestHeight = this.getChildHeight();

        let newPosition = this.props.position;
        if (window.innerHeight < inputBounds.bottom + this.latestHeight) {
            newPosition = 'top';
        }
        if (inputBounds.top - this.latestHeight < 0) {
            newPosition = 'bottom';
        }

        if (this.state.position !== newPosition) {
            this.setState({position: newPosition});
        }
    }

    updateModalBounds(): void {
        if (!this.container.current) {
            return;
        }

        const modalContainer = getClosestParent(this.container.current, '.modal-content');
        const modalBounds = modalContainer.getBoundingClientRect();

        if (this.state.modalBounds.top !== modalBounds.top || this.state.modalBounds.bottom !== modalBounds.bottom) {
            this.setState({modalBounds: {top: modalBounds.top, bottom: modalBounds.bottom}});
        }
    }

    render(): React.ReactNode {
        const {
            ...props
        } = this.props;

        Reflect.deleteProperty(props, 'onLoseVisibility');

        let position = {};
        if (this.state.position === 'top') {
            position = {bottom: this.state.modalBounds.bottom - this.state.inputBounds.top};
        } else {
            position = {top: this.state.inputBounds.bottom - this.state.modalBounds.top};
        }

        return (
            <div
                style={{position: 'fixed', zIndex: 101, width: this.state.inputBounds.width, ...position}}
                ref={this.container}
            >
                <SuggestionList
                    {...props}
                    position={this.state.position}
                    ref={this.suggestionList}
                />
            </div>
        );
    }
}
