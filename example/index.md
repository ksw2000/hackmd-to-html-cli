---
title: Example of hackmd-to-html-cli
lang: zh-TW
description: An example of using hackmd-to-html-cli
robots: noindex
dir: ltr
tags: hack
---

# hackmd-to-html-cli

[![NPM version](https://img.shields.io/npm/v/hackmd-to-html-cli.svg?logo=npm&style=flat-square)](https://www.npmjs.org/package/hackmd-to-html-cli) ![](https://img.shields.io/github/license/ksw2000/hackmd-to-html-cli?color=yellow&style=flat-square) ![](https://img.shields.io/github/actions/workflow/status/ksw2000/hackmd-to-html-cli/gitpage.yml?branch=main&style=flat-square) ![](https://img.shields.io/npm/dt/hackmd-to-html-cli?color=blue&style=flat-square)

[toc]


## Title
### h3
#### h4
##### h5
###### h6

## Horizontal line

`---`

---

`***`

***

## Blockquote

> blockquoute
> > Hello
> 

> Using the syntax below to specifiy your **name, time and color** to vary the blockquotes.
> [name=ChengHan Wu] [time=Sun, Jun 28, 2015 9:59 PM] [color=#907bf7]
> > Even support the nest blockquotes!
> > [name=ChengHan Wu] [time=Sun, Jun 28, 2015 10:00 PM] [color=red]

## Render CSV as table

You can use write csv in the codeblock:

~~~md
```csvpreview {header="true"}
firstName,lastName,email,phoneNumber
John,Doe,john@doe.com,0123456789
Jane,Doe,jane@doe.com,9876543210
James,Bond,james.bond@mi6.co.uk,0612345678
```
~~~

which rendered to:

```csvpreview {header="true"}
firstName,lastName,email,phoneNumber
John,Doe,john@doe.com,0123456789
Jane,Doe,jane@doe.com,9876543210
James,Bond,james.bond@mi6.co.uk,0612345678
```

## Text

`~~del~~` ~~del~~ 

`*italic*` *italic* 

`_italic_` _italic_

`**bold**` **bold**

`__bold__` __bold__

`++inserted++` ++inserted++ 

`==marked==` ==marked==

`H~2~O` H~2~O

`1^st^` 1^st^

`{超電磁砲|Railgun}` {超電磁砲|Railgun}

:accept: :smile: :+1: :aquarius: :hot_face:

See repository on github: https://github.com/ksw2000/hackmd-to-html-cli/

[hackmd-to-html-cli](https://github.com/ksw2000/hackmd-to-html-cli/ "A node.js package")

## Typographic Replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,

Remarkable -- awesome

"Smartypants, double quotes"

'Smartypants, single quotes'

## List

+ Eigensystems
    + Eigenvalue
    + Eigenvector
+ Inner-Product Vector Spaces

1. 高海千歌
2. 渡辺曜
3. 桜内梨子

Start numbering with offset

10. 諏訪ななか
1. 高槻かなこ
2. 小宮有紗 


## Check box

- [x] checked
- [ ] unchecked

## Table

| th | th | th  |
|:---|:---:|---:|
| left | center | right |
|xxxxxx|xxxxxx|xxxxxx|

## Container

:::success
Yes :tada:
:::

:::info
This is a message :mega:
:::

:::warning
Watch out :zap:
:::

:::danger
Oh No! :fire:
:::

:::spoiler Click to show details
You found me :stuck_out_tongue_winking_eye:
:::

:::spoiler {state="open"} Expand the spoiler container by default
You found me :stuck_out_tongue_winking_eye:
:::

## Externals

### YouTube
{%youtube oCgdmlee5vQ %}

### Vimeo
{%vimeo 124148255 %}

### Gist
{%gist schacon/4277 %}

<!--
Not work on hackMD
### SlideShare
{%slideshare briansolis/26-disruptive-technology-trends-2016-2018-56796196 %}
-->

### Speakerdeck
{%speakerdeck sugarenia/xxlcss-how-to-scale-css-and-keep-your-sanity %}

### PDF
**Caution: this might be blocked by your browser if not using an `https` URL.**
{%pdf https://www.w3.org/TR/WAI-WEBCONTENT/wai-pageauth.pdf %}The text here can be rendered.

### Figma
{%figma https://www.figma.com/file/FlUge76mJYUB4hsMyLbRXH/Primer-Primitives-Community?node-id=9%3A2 %}

## MathJax

A matrix $A$ is diagonalizable if there is a diagonal matrix $D$ and an invertible matrix $P$ s.t.
$$P^{-1}AP=D$$

For example:

$$
\begin{bmatrix}2&-1\\-1&1\end{bmatrix}\begin{bmatrix}6&-1\\2&3\end{bmatrix}\begin{bmatrix}1&1\\1&2\end{bmatrix}=\begin{bmatrix}5&0\\0&4\end{bmatrix}
$$

## Code

```c
#include<stdio.h>
int main(){
    printf("hello\n");
    return 0;
}
```

```go=
package main

import (
	"io"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		io.WriteString(w, "Hello, TLS!\n")
	})

	// One can use generate_cert.go in crypto/tls to generate cert.pem and key.pem.
	log.Printf("About to listen on 8443. Go to https://127.0.0.1:8443/")
	err := http.ListenAndServeTLS(":8443", "cert.pem", "key.pem", nil)
	log.Fatal(err)
}
```

```
plaintext
```

Specify the start line number for code block

```javascript=100
var s = "JavaScript syntax highlighting";
alert(s);
function $initHighlight(block, cls) {
  try {
    if (cls.search(/\bno\-highlight\b/) != -1)
      return process(block, true, 0x0F) +
             ' class=""';
  } catch (e) {
    /* handle exception */
  }
  for (var i = 0 / 2; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined)
      return /\d+[\s/]/g;
  }
}
```

Continue the previous code block’s line number

```javascript=+
var s = "JavaScript syntax highlighting";
alert(s);
```

Super long text without breaks

```!
When you’re a carpenter making a beautiful chest of drawers, you’re not going to use a piece of plywood on the back.
```

## UML Diagrams

### Sequence Diagrams

```sequence
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```

### Flow Charts

```flow
st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.google.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks

st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1
```

### Graphviz

```graphviz
digraph hierarchy {
  nodesep=1.0 // increases the separation between nodes
  
  node [color=Red,fontname=Courier,shape=box] //All nodes will this shape and colour
  edge [color=Blue, style=dashed] //All the lines look like this

  Headteacher->{Deputy1 Deputy2 BusinessManager}
  Deputy1->{Teacher1 Teacher2}
  BusinessManager->ITManager
  {rank=same;ITManager Teacher1 Teacher2}  // Put them on the same level
}
```

### Mermaid

```mermaid
pie showData
    title Key elements in Product X
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  5
```


### Abc

```abc
X:1
T:Speed the Plough
M:4/4
C:Trad.
K:G
|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|
GABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|
|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|
g2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|
```

### PlantUML

```plantuml
start
if (condition A) then (yes)
  :Text 1;
elseif (condition B) then (yes)
  :Text 2;
  stop
elseif (condition C) then (yes)
  :Text 3;
elseif (condition D) then (yes)
  :Text 4;
else (nothing)
  :Text else;
endif
stop
```

### Vega-Lite

```vega
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "data": {"url": "https://vega.github.io/editor/data/barley.json"},
  "mark": "bar",
  "encoding": {
    "x": {"aggregate": "sum", "field": "yield", "type": "quantitative"},
    "y": {"field": "variety", "type": "nominal"},
    "color": {"field": "site", "type": "nominal"}
  }
}
```

### Fretboard

```fretboard {title="horizontal, 6 frets, with nut", type="h6"}
-oO-*-
--o-o-
-o-oo-
-o-oO-
-oo-o-
-*O-o-
  3
```

> More information about **sequence diagrams** syntax [here](http://bramp.github.io/js-sequence-diagrams/).
> More information about **flow charts** syntax [here](http://adrai.github.io/flowchart.js/).
> More information about **graphviz** syntax [here](http://www.tonyballantyne.com/graphs.html)
> More information about **mermaid** syntax [here](http://mermaid-js.github.io/mermaid)
> More information about **abc** syntax [here](http://abcnotation.com/learn)
> More information about **vega** syntax [here](https://vega.github.io/vega-lite/docs)
> More information about **fretboard** syntax [here](https://hackmd.io/@docs/fretboard-syntax)

## YAML metadata

See: [https://hackmd.io/yaml-metadata](https://hackmd.io/yaml-metadata)

## Images

`![Alt](URL)`

![data-structure-in-c-sakura-tomoyo](https://raw.githubusercontent.com/ksw2000/Data-Structure-in-C/master/meme/data-structure-in-c-sakura-tomoyo.png)

`![Alt](URL "with title")`

![data-structure-in-c-sakura-tomoyo](https://raw.githubusercontent.com/ksw2000/Data-Structure-in-C/master/meme/data-structure-in-c-sakura-tomoyo.png "Fundamentals Data Structure in C")

`![Alt](URL =widthxheight)`

![data-structure-in-c-sakura-tomoyo](https://user-images.githubusercontent.com/13825170/226702911-bb7ce9ce-4aba-4ca5-b3b8-ffb85a55cb61.png =400x225)

## Definition Lists

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b

## Abbreviations

*[HTML]: Hyper Text Markup Language
*[W3C]:  World Wide Web Consortium

The HTML specification is maintained by the W3C.

## Footnote
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.
    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
