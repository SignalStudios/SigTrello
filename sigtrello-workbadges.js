/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrellodom-boardwindow.ts'/>
var SigTrello;
(function (SigTrello) {
    function toPercentage(n, total) {
        if (total == 0.0)
            return "100";
        else
            return (n * 100 / total).toFixed(0);
    }

    function showTitleWorkBadges() {
        var board = SigTrelloDom.BoardWindow.Board.current;
        if (!board || SigTrello.spamLimit())
            return;

        board.lists.forEach(function (list) {
            list.cards.forEach(function (card) {
                if (card.badges.filter(function (badge) {
                    return badge.isPoints;
                }).length > 0)
                    return;

                var work = SigTrello.parseTitleWork(card.displayName);
                var newDisplayName = SigTrello.stripTitleWork(card.displayName);
                if (newDisplayName != card.displayName) {
                    console.log("Hiding display name:", card.displayName, "=>", newDisplayName);
                    card.displayName = newDisplayName;

                    var titleFormat = 5 /* Badge_LongDescription */;
                    var badgeFormat = 1 /* Badge_WorkOfCurrent */;

                    var perc = toPercentage(work.worked, work.remaining + work.worked);

                    var newBadge = $("<div class=\"badge\"></div>").prop("title", SigTrello.toTrelloPoints(titleFormat, work)).attr("style", "border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 " + perc + "%, #000000 " + perc + "%)").addClass(SigTrello.isWorkComplete(work) ? "badge-state-complete" : "").append($("<span class=\"badge-icon icon-sm icon-clock\" style=\"color: white;\"></span>")).append($("<span class=\"badge-text\"></span>").text(SigTrello.toTrelloPoints(badgeFormat, work)).prop("sigtrello-work", work));
                    card.addBadge(newBadge);
                }
            });
        });
    }
    SigTrello.showTitleWorkBadges = showTitleWorkBadges;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-workbadges.js.map
