/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>

var SigTrello;
(function (SigTrello) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

    function getBestByNameIndex(name, index, items) {
        if (items.length > index && items[index].name == name)
            return items[index];

        var matchingName = $.grep(items, function (i) {
            return i.name == name;
        }, false);
        if (matchingName.length == 1)
            return matchingName[0];

        return null;
    }
    SigTrello.getBestByNameIndex = getBestByNameIndex;

    function authorize() {
        Trello.authorize({
            type: "popup",
            name: "SigTrello",
            persist: true,
            interactive: true,
            scope: { read: true, write: true, account: false },
            expiration: "never"
        });
    }
    SigTrello.authorize = authorize;

    function getFlatName($node) {
        var $elements = $node.contents();
        var s = "";
        for (var i = 0; i < $elements.length; ++i) {
            var element = $elements.get(i);
            if (element.nodeName == 'A') {
                s += $(element).attr("href");
            } else {
                s += $(element).text();
            }
        }
        return s;
    }
    SigTrello.getFlatName = getFlatName;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-core.js.map
