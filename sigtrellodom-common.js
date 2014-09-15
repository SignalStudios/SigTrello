/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>
var SigTrelloDom;
(function (SigTrelloDom) {
    function getOrCreateCached(element, cacheId, create, invalidate) {
        var cached = element[cacheId];
        if (cached == null || (invalidate && invalidate(cached)))
            element[cacheId] = cached = create(element);
        return cached;
    }

    function invalidateCached(element, cacheId) {
        element[cacheId] = null;
    }

    function ownerOf(element, selector, cacheId, create, invalidate) {
        return getOrCreateCached($(element).parents(selector).get(0), cacheId, create, invalidate);
    }
    SigTrelloDom.ownerOf = ownerOf;

    function allUnder(element, selector, cacheId, create, invalidate) {
        return $(element).find(selector).map(function (index, childElement) {
            return getOrCreateCached(childElement, cacheId, create, invalidate);
        }).toArray();
    }
    SigTrelloDom.allUnder = allUnder;
})(SigTrelloDom || (SigTrelloDom = {}));
//# sourceMappingURL=sigtrellodom-common.js.map
