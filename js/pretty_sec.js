console.log('Pretty SEC loaded.');

var remove_element = function (e) {
    if (e == null) return;
    if (e.parentNode == null) return;
    e.parentNode.removeChild(e);
};

var remove_useless_raw_elements = function () {
    var bye_queue = [];

    var lines = document.getElementsByTagName('hr');
    for (var ix = 0; ix < lines.length; ix++) {
        var ln = lines[ix];
        if (ln.getAttribute('style') === 'page-break-after:always') {
            bye_queue.push(ln);
            bye_queue.push(ln.previousElementSibling);
            bye_queue.push(ln.previousElementSibling.previousElementSibling);
            bye_queue.push(ln.nextElementSibling);
            bye_queue.push(ln.nextElementSibling.nextElementSibling);
        }
    }

    var hdr_text = document.querySelectorAll('filename > description > text')[0];
    while (hdr_text.childNodes.length > 0) {
        var ch = hdr_text.childNodes[0];
        bye_queue.push(ch);
        hdr_text.removeChild(ch);
        if ((ch.tagName != null) && (ch.tagName.toLowerCase() === 'hr')) {
            break;
        }
    }

    bye_queue.forEach(remove_element);
};

var remove_styles = function () {
    document.body.setAttribute('style', '');

    var walker = document.createTreeWalker(document.body,
                                           NodeFilter.SHOW_ELEMENT,
                                           {acceptNode: function(){ return NodeFilter.FILTER_ACCEPT; }},
                                           false);

    var current = null;
    while (current = walker.nextNode()) {
        var style = current.getAttribute('style');
        if (style != null) {
            if (style.indexOf('text-align:center') >= 0) {
                current.classList.add('centered');
            }
            if (style.indexOf('font-weight:bold') >= 0) {
                current.classList.add('bolded');
            }
            if (style.indexOf('text-align:right') >= 0) {
                current.classList.add('aligned-right');
            }
            if (style.indexOf('text-align:left') >= 0) {
                current.classList.add('aligned-left');
            }
            if (style.indexOf('font-size:') >= 0) {
                var groups = /font-size:(\d+)pt/.exec(style);
                if ((groups != null) && (groups.length == 2)) {
                    current.classList.add('text' + groups[1]);
                }
            }
            if (style.indexOf('border-bottom:') >= 0) {
                var groups = /border-bottom:(\d+)px (solid) (#\d+)/.exec(style);
                if ((groups != null) && (groups.length == 4)) {
                    current.classList.add('bordered-on-bottom');
                }
            }
            current.setAttribute('style', '');
        }
    }
};

var convert_element_types = function () {
    console.log("convert_element_types");
    var font_elems = Array.apply(null, document.getElementsByTagName('font'));
    font_elems.forEach(function(current){
        var replacement = document.createElement('span');
        for (var ix = 0; ix < current.attributes.length; ix++) {
            replacement.setAttribute(current.attributes[ix].name,
                                     current.attributes[ix].value);
        }
        while (current.childNodes.length > 0) {
            var child = current.childNodes[0];
            current.removeChild(child);
            replacement.appendChild(child);
        }
        current.parentNode.insertBefore(replacement, current);
        current.parentNode.removeChild(current);
    });
};

var inject_stylesheet = function () {
    var link = document.getElementById('pretty-sec-css-link');
    console.log('chrome.runtime.getURL', chrome.runtime.getURL('css/pretty_sec.css'));
    if (link == null) {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', chrome.runtime.getURL('css/pretty_sec.css'));
        link.setAttribute('id', 'pretty-sec-css-link');

        document.head.appendChild(link);
    }
};

var prettify_sec_filing = function (msg, sender) {
    remove_useless_raw_elements();
    convert_element_types();
    remove_styles();
    inject_stylesheet();
    return null;
};


chrome.runtime.onMessage.addListener(function(msg, sender, respond){
    console.log("chrome.runtime.onMessage");

    var MessageMap = {
        'prettify_sec_filing': prettify_sec_filing
    };

    if (MessageMap.hasOwnProperty(msg.name) === true) {
        var msg_handler = MessageMap[msg.name];
        respond(msg_handler.call(null, msg, sender));
    } else {
        console.log("No handler registered for message named", msg.name);
    }
});

chrome.runtime.sendMessage({name: 'show_page_action'});
