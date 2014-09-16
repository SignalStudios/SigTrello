/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
var SigTrello;
(function (SigTrello) {
    function replaceWithServiceLinks(pattern, iconUrl, linkReplacementPattern, textReplacementPattern) {
        var $where = $(".checklist-item-details-text, .current-comment p, .phenom-desc, .card-detail-item .markeddown p");
        doReplaceWithServiceLinks($where, pattern, iconUrl, linkReplacementPattern, textReplacementPattern);
    }
    SigTrello.replaceWithServiceLinks = replaceWithServiceLinks;

    function doReplaceWithServiceLinks($where, pattern, iconUrl, linkReplacementPattern, textReplacementPattern) {
        var replacementPattern = "<a href=\"" + linkReplacementPattern + "\" target=\"_blank\" class=\"known-service-link\">" + "<img src=\"" + iconUrl + "\" class=\"known-service-icon\">" + "<span>" + textReplacementPattern + "</span>" + "</a>";

        $where.each(function (i, elem) {
            $(elem).contents().each(function (childI, childElem) {
                if (childElem.nodeType == Node.TEXT_NODE) {
                    var original = childElem.textContent;
                    var replaced = original.replace(pattern, replacementPattern);
                    if (original != replaced)
                        $(childElem).replaceWith(replaced);
                }
            });
        });
    }
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-servicelinks.js.map
