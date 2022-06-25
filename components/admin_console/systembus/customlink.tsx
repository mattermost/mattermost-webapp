import * as React from 'react';
import {DefaultLinkFactory, DefaultLinkModel, DefaultLinkWidget, DefaultLabelModel, DefaultLabelWidget, DiagramEngine, PointModel} from '@projectstorm/react-diagrams';

export class MattermostLinkModel extends DefaultLinkModel {
    constructor() {
        super({
            type: 'mattermost',
        });
    }
}

export class MattermostLinkFactory extends DefaultLinkFactory {
    constructor() {
        super('mattermost');
    }

    generateModel(): MattermostLinkModel {
        return new MattermostLinkModel();
    }

    generateReactWidget({model}: {model: MattermostLinkModel}) {
        return (
            <g className='edge'>
                <MattermostLinkWidget link={model} diagramEngine={this.engine}/>
            </g>
        );
    }
}

export class MattermostLinkWidget extends DefaultLinkWidget {
}

