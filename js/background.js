chrome.runtime.onMessage.addListener(function(msg, sender, respond){
	console.log('msg', msg);

	if (msg.name === 'show_page_action') {
        if (sender.tab != null) {
            chrome.pageAction.show(sender.tab.id);
        }
	}
	
});

chrome.pageAction.onClicked.addListener(function(tab){
    console.log('chrome.pageAction.onClicked');
    chrome.tabs.sendMessage(tab.id, {name: 'prettify_sec_filing'});
});

