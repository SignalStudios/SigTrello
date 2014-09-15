/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrello-workparse.ts'/>
///<reference path='sigtrellodom-boardwindow.ts'/>
var SigTrello;
(function (SigTrello) {
    var convertToBadges = true;

    function toPercentage(n, total) {
        if (total == 0.0)
            return "100";
        else
            return (n * 100 / total).toFixed(0);
    }

    function showTitleWorkBadges() {
        if (!convertToBadges)
            return;

        board_showCardWorkBadges();
        card_showChecklistWorkBadges();
    }
    SigTrello.showTitleWorkBadges = showTitleWorkBadges;

    function createCardBadge(work) {
        var titleFormat = 5 /* Badge_LongDescription */;
        var badgeFormat = 1 /* Badge_WorkOfCurrent */;

        var perc = toPercentage(work.worked, work.remaining + work.worked);

        return $("<div class=\"sigtrello-time badge\"></div>").prop("title", SigTrello.toTrelloPoints(titleFormat, work)).attr("style", "border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 " + perc + "%, #000000 " + perc + "%)").addClass(SigTrello.isWorkComplete(work) ? "badge-state-complete" : "").append($("<span class=\"badge-icon icon-sm icon-clock\" style=\"color: white;\"></span>")).append($("<span class=\"badge-text\"></span>").text(SigTrello.toTrelloPoints(badgeFormat, work)).prop("sigtrello-work", work));
    }

    function createChecklistBadge(work) {
        var titleFormat = 5 /* Badge_LongDescription */;
        var badgeFormat = 1 /* Badge_WorkOfCurrent */;

        var perc = toPercentage(work.worked, work.remaining + work.worked);

        return $("<span class=\"sigtrello-time\" style=\"\"></div>").prop("title", SigTrello.toTrelloPoints(titleFormat, work)).attr("style", "padding: 0px 4px; margin: 0px -4px 0px 4px; display: inline-block; text-decoration-line: initial; border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 " + perc + "%, #000000 " + perc + "%)").addClass(SigTrello.isWorkComplete(work) ? "badge-state-complete" : "").append($("<span class=\"icon-sm icon-clock\" style=\"color: white;\"></span>")).append($("<span class=\"\"></span>").text(SigTrello.toTrelloPoints(badgeFormat, work)).prop("sigtrello-work", work));
    }

    function element_replaceWithFakeBadges(node) {
        if (node.nodeType == Node.TEXT_NODE) {
            var work = SigTrello.parseTitleWork(node.textContent);
            var newTitle = SigTrello.stripTitleWork(node.textContent);

            if (node.textContent != newTitle) {
                var badge = createChecklistBadge(work);
                $(node.parentNode).append(badge);
                node.textContent = newTitle;
            }
        } else {
            var children = node.childNodes;
            for (var i = 0; i < children.length; ++i)
                element_replaceWithFakeBadges(children[i]);
        }
    }

    function board_showCardWorkBadges() {
        var board = SigTrelloDom.BoardWindow.Board.current;
        if (!board || SigTrello.spamLimit())
            return;

        board.lists.forEach(function (list) {
            list.cards.forEach(function (card) {
                var work = SigTrello.parseTitleWork(card.displayName);
                var newDisplayName = SigTrello.stripTitleWork(card.displayName);
                if (newDisplayName != card.displayName) {
                    card.displayName = newDisplayName;
                    card.badges.forEach(function (badge) {
                        if (badge.isTimeEst)
                            card.removeBadge(badge);
                    });
                    card.addBadge(createCardBadge(work));
                }
            });
        });
    }

    function card_showChecklistWorkBadges() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (!card || SigTrello.spamLimit())
            return;

        card.checklists.forEach(function (checklist) {
            checklist.items.forEach(function (checkitem) {
                element_replaceWithFakeBadges($(checkitem.element).find('.checklist-item-details-text')[0]);
            });
        });
    }
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-workbadges.js.map
