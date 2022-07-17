function parseURI(): {[k: string]: string} {
    let result: any = {};
    let temp1 = window.location.search.substring(1).split('&');
    if (temp1.length>0) {
        let temp2;
        for (let i=0; i<temp1.length; i++) {
            temp2 = temp1[i].split('=');
            result[temp2[0]] = decodeURIComponent(temp2[1]);
        }
    }
    result['$hash'] = window.location.hash;
    result['$host'] = window.location.host;
    result['$hostname'] = window.location.hostname;
    result['$href'] = window.location.href;
    result['$origin'] = window.location.origin;
    result['$pathname'] = window.location.pathname;
    result['$port'] = window.location.port;
    result['$protocol'] = window.location.protocol;
    result['$search'] = window.location.search;
    return result;
}

