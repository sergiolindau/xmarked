/**
 * XMarked
 * 
 * It combines Marked, MathJax and highlight.js into an engine that renders
 * markdown files with latex-embedded and does Wiki-like references
 * replacement.
 * 
 * Wiki references are nested in double brackets like:
 *     The [[reference]] can be...
 * The reference can be displayed with diferent text like
 *     The [[reference | alternative text]] can be...
 * 
 * To type Latex there are two ways: inline and display mode. To type
 * inline use \\( to begin math mode and \\) to end math mode:
 *     When \\(x \gt 3\\) the value...
 * To type in display mode use $$ to start and end math mode:
 *     $$a^2=b^2+c^2$$
 * 
 * The code hihglighted start with (javascript example)
 *     ```javascript
 *     function plus(a,b) {
 *         return (a+b);
 *     }
 *     ```
 * 
 * depends: parseURI.ts
 */

/**
 * TODO:
 * - error checking
 * - automatic load (and error detection) of Marked, MathJax
 * - default page load if file not found
 * - use {{command|arg1|arg2|arg3}} same as wiki
 */

// https://docs.mathjax.org/en/latest/web/configuration.html

declare const marked: {
    parse: Function
}

declare const hljs: {
    highlightAll: Function;
}

declare const MathJax: {
    typeset: Function
}

var XMarkedContainer: HTMLElement | null;
var XMarkedPrefix: string = "";
var XMarkedPathname: string = "";
var XMarkedDefault: string = "";
var XMarkedURL: string = "";
var XMarkedAddLabel: boolean = false;
var XMarkedOnLoad: Array<string> = [];

//const WikiReference = /(\[\[)([^\[\]]+)(\]\])/gm;
const WikiReference = /(\[\[)(([^\[\]]|\[(?!\[)|\](?!\]))+)(\]\])/gm
function replaceWikiReference(mdstr: string) {
    let result: string = "";
    let last_match = 0;
    let match: RegExpExecArray | null;
    let match_ref: Array<string>;
    let ref, disp: string;
    let cmd = "";
    do {
        match = WikiReference.exec(mdstr);
        if (match) {
            result += mdstr.substring(last_match,match.index);
            last_match = match.index + match['0'].length;
            match_ref = match['2'].split("|");
            ref = match_ref[0].trim();
            let colon = ref.indexOf(":");
            if (colon>=0) {
                cmd = ref.substring(0,colon);
            }
            if (match_ref.length==1) {
                disp = match_ref[0].trim();
            }
            else if (match_ref.length==2) {
                disp = match_ref[1].trim();
            }
            else {
                throw new Error("replaceWikiReference: invalid reference: "+match['0']);
            }
            let src: any;
            switch (cmd) {
                case "":
                case "md":
                    if (ref.indexOf("://")==-1) {
                    ref = XMarkedPathname +
                        "?url=" +
                        encodeURIComponent(
                            XMarkedPrefix +
                            ref.replace(/ /g,"_") ) +
                        ".md";
                    }
                    result += `[${disp}](${ref})`;
                break;
                case "js":
                    src = eval(ref);
                    result += "```javascript\n";
                    if (typeof src == 'function') {
                        result += src;
                    }
                    else {
                        result += ref + " = " + src;
                    }
                    result += "\n```\n";
                break;
                case "javascript":
                    XMarkedOnLoad.push(ref)
                    result += "\n";
                break;
            }

        }
    } while (match);
    result += mdstr.substring(last_match);
    return result;
}

function XMarkedListener (this: XMLHttpRequest) {
    let md_prefix : string;
    if (XMarkedAddLabel) {
        md_prefix = decodeURIComponent(
            XMarkedURL.substring(
                XMarkedURL.lastIndexOf("/")+1,
                XMarkedURL.lastIndexOf(".")
            )
        ).replace(/_/g," ");
        md_prefix = (md_prefix!="README")?("# "+ md_prefix + "\n\n"):"";
    }
    else {
        md_prefix = "";
    }
    (XMarkedContainer as HTMLElement).innerHTML = marked.parse(md_prefix + replaceWikiReference(this.responseText));
    document.title = document.getElementsByTagName('h1')[0].innerHTML;
    for (let i=0;i<XMarkedOnLoad.length;i++) {
        eval(XMarkedOnLoad[i]);
    }
    MathJax.typeset();
    hljs.highlightAll();
};

function XMarked(element: string | HTMLElement, default_md?: string, addlabel?: boolean) {
    XMarkedContainer = (typeof element== 'string')?document.getElementById(element):element;
    XMarkedDefault = (default_md)?default_md:"";
    XMarkedAddLabel = (addlabel)?addlabel:false;
    if (XMarkedContainer) {
        let parameters = parseURI();
        XMarkedPathname = parameters['$pathname'];
        if ('url' in parameters) {
            XMarkedPrefix = parameters.url.substring(0,parameters.url.lastIndexOf("/")+1);
            XMarkedURL = parameters.url;
        } else if (default_md) {
            XMarkedPrefix = default_md.substring(0,default_md.lastIndexOf("/")+1);
            XMarkedURL = default_md;
        }
        else {
            throw new URIError("XMarked: file parameter not found in URI or function call.");
        }
        let oReq = new XMLHttpRequest();
        oReq.onload = XMarkedListener;
        oReq.open("get", XMarkedURL, true);
        oReq.send();
    }
}