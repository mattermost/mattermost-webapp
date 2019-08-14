// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Markdown from 'components/markdown';

export default function HelpFormatting() {
    const renderRawExample = (example) => {
        return (
            <div className='post-code post-code--wrap'>
                <code className='hljs'>{example}</code>
            </div>
        );
    };

    const renderRawExampleWithResult = (example) => {
        return (
            <div>
                {renderRawExample(example)}
                <p>
                    <FormattedMessage
                        id='help.formatting.renders'
                        defaultMessage='Renders as:'
                    />
                </p>
                {' '}
                <Markdown message={example}/>
            </div>
        );
    };

    return (
        <div>
            <h1 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.title'
                    defaultMessage='Formatting Text'
                />
            </h1>
            <hr/>
            <p>
                <FormattedMessage
                    id='help.formatting.intro'
                    defaultMessage='Markdown makes it easy to format messages. Type a message as you normally would, and use these rules to render it with special formatting.'
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.style.title'
                    defaultMessage='Text Style'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.style.description'
                    defaultMessage='You can use either `_` or `*` around a word to make it italic. Use two to make it bold.'
                />
            </p>
            <ul>
                <li>
                    <FormattedMarkdownMessage
                        id='help.formatting.style.listItem1'
                        defaultMessage='`_italics_` renders as _italics_'
                    />
                </li>
                <li>
                    <FormattedMarkdownMessage
                        id='help.formatting.style.listItem2'
                        defaultMessage='`**bold**` renders as **bold**'
                    />
                </li>
                <li>
                    <FormattedMarkdownMessage
                        id='help.formatting.style.listItem3'
                        defaultMessage='`**_bold-italic_**` renders as **_bold-italics_**'
                    />
                </li>
                <li>
                    <FormattedMarkdownMessage
                        id='help.formatting.style.listItem4'
                        defaultMessage='`~~strikethrough~~` renders as ~~strikethrough~~'
                    />
                </li>
            </ul>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.code.title'
                    defaultMessage='Code Block'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.formatting.code.description'
                    defaultMessage='Create a code block by indenting each line by four spaces, or by placing ``` on the line above and below your code.'
                />
            </p>
            <p>
                <FormattedMessage
                    id='help.formatting.example'
                    defaultMessage='Example:'
                />
            </p>
            <FormattedMessage
                id='help.formatting.codeBlock'
                defaultMessage='Code block'
            >
                {(example) => renderRawExampleWithResult('```\n' + example + '\n```')}
            </FormattedMessage>
            <h3 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.syntax.title'
                    defaultMessage='Syntax Highlighting'
                />
            </h3>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.syntax.description'
                    defaultMessage='To add syntax highlighting, type the language to be highlighted after the ``` at the beginning of the code block. Mattermost also offers four different code themes (GitHub, Solarized Dark, Solarized Light, Monokai) that can be changed in **Account Settings** > **Display** > **Theme** > **Custom Theme** > **Center Channel Styles**'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.supportedSyntax'
                    defaultMessage={'Supported languages are: `as`, `applescript`, `osascript`, `scpt`, `bash`, `sh`, `zsh`, `clj`, `boot`, `cl2`, `cljc`, `cljs`, `cljs.hl`, `cljscm`, `cljx`, `hic`, `coffee`, `_coffee`, `cake`, `cjsx`, `cson`, `iced`, `cpp`, `c`, `cc`, `h`, `c++`, `h++`, `hpp`, `cs`, `csharp`, `css`, `d`, `di`, `dart`, `delphi`, `dpr`, `dfm`, `pas`, `pascal`, `freepascal`, `lazarus`, `lpr`, `lfm`, `diff`, `django`, `jinja`, `dockerfile`, `docker`, `erl`, `fortran`, `fsharp`, `fs`, `gcode`, `nc`, `go`, `groovy`, `handlebars`, `hbs`, `html.hbs`, `html.handlebars`, `hs`, `hx`, `java`, `jsp`, `js`, `jsx`, `json`, `jl`, `kt`, `ktm`, `kts`, `less`, `lisp`, `lua`, `mk`, `mak`, `md`, `mkdown`, `mkd`, `matlab`, `m`, `mm`, `objc`, `obj-c`, `ml`, `perl`, `pl`, `php`, `php3`, `php4`, `php5`, `php6`, `ps`, `ps1`, `pp`, `py`, `gyp`, `r`, `ruby`, `rb`, `gemspec`, `podspec`, `thor`, `irb`, `rs`, `scala`, `scm`, `sld`, `scss`, `st`, `styl`, `sql`, `swift`, `tex`, `vbnet`, `vb`, `bas`, `vbs`, `v`, `veo`, `xml`, `html`, `xhtml`, `rss`, `atom`, `xsl`, `plist`, `yaml`'}
                />
            </p>
            <p>
                <FormattedMessage
                    id='help.formatting.example'
                    defaultMessage='Example:'
                />
            </p>
            <FormattedMessage
                id='help.formatting.syntaxEx'
                defaultMessage={'```go\npackage main\nimport "fmt"\nfunc main() \\{\n    fmt.Println("Hello, 世界")\n\\}\n```'}
                values={{dummy: ''}}
            >
                {(example) => renderRawExample(example)}
            </FormattedMessage>
            <p>
                <FormattedMessage
                    id='help.formatting.renders'
                    defaultMessage='Renders as:'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.githubTheme'
                    defaultMessage='**GitHub Theme**'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/syntax-highlighting-github.PNG'
                    alt='go syntax-highlighting'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.solirizedDarkTheme'
                    defaultMessage='**Solarized Dark Theme**'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/syntax-highlighting-sol-dark.PNG'
                    alt='go syntax-highlighting'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.solirizedLightTheme'
                    defaultMessage='**Solarized Light Theme**'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/syntax-highlighting-sol-light.PNG'
                    alt='go syntax-highlighting'
                    className='markdown-inline-img'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.monokaiTheme'
                    defaultMessage='**Monokai Theme**'
                />
            </p>
            <p>
                <img
                    src='https://docs.mattermost.com/_images/syntax-highlighting-monokai.PNG'
                    alt='go syntax-highlighting'
                    className='markdown-inline-img'
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.inline.title'
                    defaultMessage='In-line Code'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.formatting.inline.description'
                    defaultMessage='Create in-line monospaced font by surrounding it with backticks.'
                />
            </p>
            {renderRawExample('`monospace`')}
            <p>
                <FormattedMessage
                    id='help.formatting.renders'
                    defaultMessage='Renders as:'
                >
                    {(text) => (<Markdown message={text + ' `monospace`'}/>)}
                </FormattedMessage>
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.links.title'
                    defaultMessage='Links'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.formatting.links.description'
                    defaultMessage='Create labeled links by putting the desired text in square brackets and the associated link in normal brackets.'
                />
            </p>
            <FormattedMessage
                id='help.formatting.linkEx'
                defaultMessage={'[Check out Mattermost!](https://about.mattermost.com/)'}
            >
                {(example) => (
                    <div>
                        <Markdown message={'`' + example + '`'}/>
                        <FormattedMessage
                            id='help.formatting.renders'
                            defaultMessage='Renders as:'
                        >
                            {(text) => (<Markdown message={text + ' ' + example}/>)}
                        </FormattedMessage>
                    </div>
                )}
            </FormattedMessage>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.images.title'
                    defaultMessage='In-line Images'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.images.description'
                    defaultMessage='Create in-line images using an `!` followed by the alt text in square brackets and the link in normal brackets. Add hover text by placing it in quotes after the link.'
                />
            </p>
            <FormattedMessage
                id='help.formatting.imagesExample'
                defaultMessage={'![alt text](link "hover text")\n\nand\n\n[![Build Status](https://travis-ci.org/mattermost/mattermost-server.svg?branch=master)](https://travis-ci.org/mattermost/mattermost-server) [![Github](https://assets-cdn.github.com/favicon.ico)](https://github.com/mattermost/mattermost-server)'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.emojis.title'
                    defaultMessage='Emojis'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.emojis.description'
                    defaultMessage={'Open the emoji autocomplete by typing `:`. A full list of emojis can be found [here](!http://www.emoji-cheat-sheet.com/). It is also possible to create your own [Custom Emoji](!http://docs.mattermost.com/help/settings/custom-emoji.html) if the emoji you want to use doesn\'t exist.'}
                />
            </p>
            {renderRawExampleWithResult(':smile: :+1: :sheep:')}
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.lines.title'
                    defaultMessage='Lines'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.lines.description'
                    defaultMessage='Create a line by using three `*`, `_`, or `-`.'
                />
            </p>
            <p>
                <FormattedMessage
                    id='help.formatting.renders'
                    defaultMessage='Renders as:'
                >
                    {(text) => <Markdown message={'`***` ' + text}/>}
                </FormattedMessage>
            </p>
            <Markdown message='***'/>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.quotes.title'
                    defaultMessage='Block quotes'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.quotes.description'
                    defaultMessage='Create block quotes using `>`.'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.quotesExample'
                    defaultMessage='`> block quotes` renders as:'
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.quotesRender'
                    defaultMessage='> block quotes'
                />
            </p>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.lists.title'
                    defaultMessage='Lists'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.lists.description'
                    defaultMessage='Create a list by using `*` or `-` as bullets. Indent a bullet point by adding two spaces in front of it.'
                />
            </p>
            <FormattedMessage
                id='help.formatting.listExample'
                defaultMessage={'* list item one\n* list item two\n    * item two sub-point'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <p>
                <FormattedMessage
                    id='help.formatting.ordered'
                    defaultMessage='Make it an ordered list by using numbers instead:'
                />
            </p>
            <FormattedMessage
                id='help.formatting.orderedExample'
                defaultMessage={'1. Item one\n2. Item two'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <p>
                <FormattedMessage
                    id='help.formatting.checklist'
                    defaultMessage='Make a task list by including square brackets:'
                />
            </p>
            <FormattedMessage
                id='help.formatting.checklistExample'
                defaultMessage={'- [ ] Item one\n- [ ] Item two\n- [x] Completed item'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.tables.title'
                    defaultMessage='Tables'
                />
            </h2>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.tables.description'
                    defaultMessage={'Create a table by placing a dashed line under the header row and separating the columns with a pipe `|`. (The columns don\'t need to line up exactly for it to work). Choose how to align table columns by including colons `:` within the header row.'}
                />
            </p>
            <FormattedMessage
                id='help.formatting.tableExample'
                defaultMessage={'| Left-Aligned  | Center Aligned  | Right Aligned |\n| :------------ |:---------------:| -----:|\n| Left column 1 | this text       |  $100 |\n| Left column 2 | is              |   $10 |\n| Left column 3 | centered        |    $1 |'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <h2 className='markdown__heading'>
                <FormattedMessage
                    id='help.formatting.headings.title'
                    defaultMessage='Headings'
                />
            </h2>
            <p>
                <FormattedMessage
                    id='help.formatting.headings.description'
                    defaultMessage={'Make a heading by typing # and a space before your title. For smaller headings, use more #\'s.'}
                />
            </p>
            <FormattedMessage
                id='help.formatting.headingsExample'
                defaultMessage={'## Large Heading\n### Smaller Heading\n#### Even Smaller Heading'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <p>
                <FormattedMarkdownMessage
                    id='help.formatting.headings2'
                    defaultMessage='Alternatively, you can underline the text using `===` or `---` to create headings.'
                />
            </p>
            <FormattedMessage
                id='help.formatting.headings2Example'
                defaultMessage={'Large Heading\n-------------'}
            >
                {(example) => renderRawExampleWithResult(example)}
            </FormattedMessage>
            <p className='links'>
                <FormattedMessage
                    id='help.learnMore'
                    defaultMessage='Learn more about:'
                />
            </p>
            <ul>
                <li>
                    <Link to='/help/messaging'>
                        <FormattedMessage
                            id='help.link.messaging'
                            defaultMessage='Basic Messaging'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/composing'>
                        <FormattedMessage
                            id='help.link.composing'
                            defaultMessage='Composing Messages and Replies'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/mentioning'>
                        <FormattedMessage
                            id='help.link.mentioning'
                            defaultMessage='Mentioning Teammates'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/attaching'>
                        <FormattedMessage
                            id='help.link.attaching'
                            defaultMessage='Attaching Files'
                        />
                    </Link>
                </li>
                <li>
                    <Link to='/help/commands'>
                        <FormattedMessage
                            id='help.link.commands'
                            defaultMessage='Executing Commands'
                        />
                    </Link>
                </li>
            </ul>
        </div>
    );
}
