/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='sigtrellodom-cardwindow.ts'/>
var SigTrello;
(function (SigTrello) {
    var reRound = /\((\d+)\)/;
    var reSquare = /\[(\d+)\]/;

    function sumChecklistTimes() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (!card || SigTrello.spamLimit())
            return;

        var checklists = SigTrelloDom.CardWindow.Card.current.checklists;
        checklists.forEach(function (checklist) {
            var round = 0.0;
            var square = 0.0;

            var anyRound = false;
            var anySquare = false;

            var works = [];
            checklist.items.forEach(function (item) {
                var includeLinks = false;
                var itemText = includeLinks ? item.textDisplayed : item.textEntered;
                var work = SigTrello.parseTitleWorkOrBadge(itemText, item.element);
                if (work)
                    works.push(work);
            });

            var work = SigTrello.sumWork(works);
            var currentWork = SigTrello.parseTitleWorkOrBadge(checklist.displayTitle, checklist.element);
            if (work && currentWork && !SigTrello.equalWork(work, currentWork)) {
                checklist.displayTitle = SigTrello.stripTitleWork(checklist.displayTitle) + " " + SigTrello.toTrelloPoints(0 /* RawTitle */, work);
            }
        });
    }
    SigTrello.sumChecklistTimes = sumChecklistTimes;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-sum-checklist-times.js.map
