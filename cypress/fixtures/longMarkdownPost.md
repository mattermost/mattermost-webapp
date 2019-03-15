# Basic Markdown Testing
Tests for text style, code blocks, in-line code and images, lines, block quotes, and headings.

### Text Style

**The following text should render as:**
_Italics_
_Ita_lics_
*Italics*
**Bold**
***Bold-italics***
**_Bold-italics_**
~~Strikethrough~~

This sentence contains **bold**, _italic_, ***bold-italic***, and ~~stikethrough~~ text.

**The following should render as normal text:**
Normal Text_
_Normal Text
_Normal Text*

### Carriage Return

Line #1 followed by one blank line

Line #2 followed by one blank line

Line #3 followed by Line #4
Line #4

### Code Blocks

```
This text should render in a code block
```

**The following markdown should not render:**
```
_Italics_
*Italics*
**Bold**
***Bold-italics***
**Bold-italics_**
~~Strikethrough~~
:) :-) ;) ;-) :o :O :-o :-O
:bamboo: :gift_heart: :dolls: :school_satchel: :mortar_board:
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
> Block Quote
- List
  - List Sub-item
[Link](http://i.giphy.com/xNrM4cGJ8u3ao.gif)
[![Github](https://assets-cdn.github.com/favicon.ico)](https://github.com/mattermost/platform)
| Left-Aligned Text | Center Aligned Text | Right Aligned Text |
| :------------ |:---------------:| -----:|
| Left column 1 | this text       |  $100 |
```

**The following links should not auto-link or generate previews:**
```
GIF: http://i.giphy.com/xNrM4cGJ8u3ao.gif
Website: https://en.wikipedia.org/wiki/Dolphin
```

**The following should appear as a carriage return separating two lines of text:**
```
Line #1 followed by a blank line

Line #2 following a blank line
```

### In-line Code

The word `monospace` should render as in-line code.

The following markdown in-line code should not render:
`_Italics_`, `*Italics*`, `**Bold**`, `***Bold-italics***`, `**Bold-italics_**`, `~~Strikethrough~~`, `:)` , `:-)` , `;)` , `:-O` , `:bamboo:` , `:gift_heart:` , `:dolls:` , `# Heading 1`, `## Heading 2`, `### Heading 3`, `#### Heading 4`, `##### Heading 5`, `###### Heading 6`

This GIF link should not preview: `http://i.giphy.com/xNrM4cGJ8u3ao.gif`
This link should not auto-link: `https://en.wikipedia.org/wiki/Dolphin`

This sentence with `
in-line code
` should appear on one line.

### In-line Images

Mattermost/platform build status:  [![Build Status](https://travis-ci.org/mattermost/platform.svg?branch=master)](https://travis-ci.org/mattermost/platform)

GitHub favicon:  ![Github](https://assets-cdn.github.com/favicon.ico)

GIF Image:
![gif](http://i.giphy.com/xNrM4cGJ8u3ao.gif)

4K Wallpaper Image (11Mb):
![4K Image](https://images.wallpaperscraft.com/image/starry_sky_shine_glitter_118976_3840x2160.jpg)

Panorama Image:
![Pano](http://amardeepphotography.com/wp-content/uploads/2012/11/Untitled_Panorama6small.jpg)

### Lines

Three lines should render with text between them:

Text above line

***

Text between lines

---

Text between lines
___

Text below line

### Block Quotes

>This text should render in a block quote.

**The following markdown should render within the block quote:**
> #### Heading 4
> _Italics_, *Italics*, **Bold**, ***Bold-italics***, **_Bold-italics_**, ~~Strikethrough~~
> :) :-) ;) :-O :bamboo: :gift_heart: :dolls:

**The following text should render in two block quotes separated by one line of text:**
> Block quote 1

Text between block quotes

> Block quote 2

### Headings

# Heading 1 font size
## Heading 2 font size
### Heading 3 font size
#### Heading 4 font size
##### Heading 5 font size
###### Heading 6 font size

### Escaped Characters

**The following text should render the same as the raw text:**
Raw: `\\teamlinux\IT-Stuff\WorkingStuff`
Markdown: \\teamlinux\IT-Stuff\WorkingStuff

**The following text should escape out the first backslash so only one backslash appears:**
Raw: `\\()#`
Markdown: \\()#

The end of this long post will be hidden until you choose to `Show More`.