/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='jquery-ba-throttle-debounce.d.ts'/>
///<reference path='trello-client.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>
///<reference path='sigtrello-dom-card-window.ts'/>

var SigTrello;
(function (SigTrello) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

    function error(message) {
        //alert( message );
    }

    var spamLimitCounter = 100;
    function spamLimit() {
        //return --spamLimitCounter < 0;
        return false;
    }

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

    var CollapseState;
    (function (CollapseState) {
        var lsId = "sigtrello-collapse-state-1";
        var collapseState = {};

        if (localStorage[lsId])
            collapseState = JSON.parse(localStorage[lsId]);

        function setCollapsedByName(board, list, collapsed) {
            collapseState[board] = collapseState[board] || {};
            collapseState[board][list] = collapsed;
            localStorage[lsId] = JSON.stringify(collapseState);
        }

        function isCollapsedByName(board, list) {
            return collapseState && collapseState[board] && collapseState[board][list];
        }

        function setCollapsed($list, collapsed) {
            var boardName = $list.find('.board-header-btn-text').text().trim();
            var listName = $list.find('.list-header-name').text().trim();
            setCollapsedByName(boardName, listName, collapsed);
        }
        CollapseState.setCollapsed = setCollapsed;

        function isCollapsed($list) {
            var boardName = $list.find('.board-header-btn-text').text().trim();
            var listName = $list.find('.list-header-name').text().trim();
            return isCollapsedByName(boardName, listName);
        }
        CollapseState.isCollapsed = isCollapsed;
    })(CollapseState || (CollapseState = {}));

    function toggleListCollapse() {
        var $list = $(this).parents('.list');
        $list.toggleClass('sigtrello-collapsed-list');
        CollapseState.setCollapsed($list, $list.hasClass('sigtrello-collapsed-list'));
        return true;
    }

    function replaceWithLink() {
        var toLink = this;
        if (!Trello.authorized()) {
            authorize();
            if (!Trello.authorized())
                return false;
        }

        var checklistItem = SigTrelloDom.CardWindow.ChecklistItem.ownerOf(this);
        var checklist = checklistItem.checklist;
        var card = checklist.card;

        var $this = $(this);

        var $checklistItem = $this.parent('.checklist-item');
        if (checklistItem.isAllOneUrl)
            return;

        $this.toggle();

        // TODO: Learn how to tame JavaScript callback hell.
        // 1.  Identify the trello list
        Trello.get("cards/" + card.shortId + "/list", { fields: "" }).done(function (list) {
            // 2. Identify the checklist item being replaced.
            Trello.get("cards/" + card.shortId + "/checklists").done(function (cardInfo) {
                var cardChecklist = getBestByNameIndex(checklist.title, checklist.index, cardInfo);
                if (cardChecklist == null) {
                    error("Checklist ambiguous or missing!");
                    return;
                }

                var cardChecklistItem = getBestByNameIndex(checklistItem.textEntered, checklistItem.index, cardChecklist.checkItems);
                if (cardChecklistItem == null) {
                    error("Checklist item ambiguous or missing!");
                    return;
                }

                // 3.  Post new card to the list
                Trello.post("lists/" + list.id + "/cards", {
                    name: checklistItem.textDisplayed,
                    desc: "Parent: " + card.url + " " + checklist.title,
                    due: null,
                    labels: card.labels.map(function (l) {
                        return l.color;
                    }).join(","),
                    idMembers: card.members.map(function (m) {
                        return m.id;
                    }).join(",")
                }).done(function (newCard) {
                    // 4.  Replace checklist item with new card
                    Trello.put("cards/" + card.shortId + "/checklist/" + cardChecklist.id + "/checkItem/" + cardChecklistItem.id + "/name", { value: newCard.url });
                });
            });
        });

        return false;
    }

    function sumCommentWork() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (!card)
            return;
        if (spamLimit())
            return;

        var estOriginal = undefined;
        var estRemaining = 0.0;
        var estWorked = 0.0;

        var pattern = /(work|worked|estimate|estimated)\s+([=+-])?(\d+\.?\d*|\d*\.?\d+)([wdhm])/gi;
        var scale = { "w": 40, "d": 8, "h": 1, "m": 1.0 / 60 };

        var foundAnyWork = false;

        card.comments.reverse().forEach(function (comment) {
            for (var match; (match = pattern.exec(comment.body.text())) !== null;) {
                var action = match[1].toLowerCase();
                var adjustmentType = match[2];
                var adjustmentValue = parseFloat(match[3]);
                var adjustmentUnit = match[4].toLowerCase();

                //console.log( "Action: ", action, " ", adjustmentType, adjustmentValue, adjustmentUnit );
                adjustmentValue *= scale[adjustmentUnit];

                foundAnyWork = true;

                switch (match[1].toLowerCase()) {
                    case "work":
                    case "worked":
                        switch (adjustmentType) {
                            case undefined:
                            case "+":
                                estWorked += adjustmentValue;
                                estRemaining -= adjustmentValue;
                                if (estRemaining < 0)
                                    estRemaining = 0;
                                break;
                            case "-":
                                estWorked -= adjustmentValue;
                                estRemaining += adjustmentValue;
                                break;
                            case "=":
                                estRemaining += (adjustmentValue - estWorked);
                                estWorked = adjustmentValue;
                                break;
                        }
                        break;

                    case "estimate":
                    case "estimated":
                        switch (adjustmentType) {
                            case "+":
                                estRemaining += adjustmentValue;
                                break;
                            case "-":
                                estRemaining -= adjustmentValue;
                                if (estRemaining < 0)
                                    estRemaining = 0;
                                break;
                            case undefined:
                            case "=":
                                estRemaining = adjustmentValue;
                                break;
                        }

                        if (estOriginal === undefined)
                            estOriginal = estRemaining + estWorked;
                        break;
                }
            }
        });

        if (estOriginal === undefined)
            estOriginal = 0.0;

        return foundAnyWork ? { "original": estOriginal, "remaining": estRemaining, "worked": estWorked } : null;
    }

    function parseTitleWork(title) {
        if (!title)
            return null;

        var matchOriginal = /\((\d*\.?\d*)\)/gi.exec(title);
        var matchWorked = /\[(\d*\.?\d*)\]/gi.exec(title);
        var matchRemaining = /\{(\d*\.?\d*)\}/gi.exec(title);

        //console.log( title, matchOriginal, matchWorked, matchRemaining );
        if (matchOriginal || matchWorked || matchRemaining) {
            var estOriginal = matchOriginal ? parseFloat(matchOriginal[1]) : 0.0;
            var estWorked = matchWorked ? parseFloat(matchWorked[1]) : 0.0;
            var estRemaining = matchRemaining ? parseFloat(matchRemaining[1]) : Math.max(estOriginal - estWorked, 0.0);

            return { "original": estOriginal, "remaining": estRemaining, "worked": estWorked };
        } else {
            return null;
        }
    }

    function stripTitleWork(title) {
        title = title.replace(/\s*\((\d*\.?\d*)\)\s*/i, "");
        title = title.replace(/\s*\[(\d*\.?\d*)\]\s*/i, "");
        title = title.replace(/\s*\{(\d*\.?\d*)\}\s*/i, "");
        return title;
    }

    function sumWork(works) {
        var sum = { "original": 0.0, "remaining": 0.0, "worked": 0.0 };

        for (var i = 0; i < works.length; ++i) {
            var work = works[i];
            sum.original += work.original;
            sum.remaining += work.remaining;
            sum.worked += work.worked;
        }

        return sum;
    }

    function toTrelloPointsNumber(n) {
        var digits = (Math.abs(n) < 10.0) ? n.toFixed(2) : (Math.abs(n) < 100.0) ? n.toFixed(1) : n.toFixed(0);

        return /^(\d+\.??\d*?)\.?0*$/.exec(digits)[1];
    }

    function toTrelloPointsFormat(work) {
        return "(" + toTrelloPointsNumber(work.original) + ") [" + toTrelloPointsNumber(work.worked) + "] {" + toTrelloPointsNumber(work.remaining) + "}";
    }

    function onChangesImpl() {
        var $checklistItemsList = $(".checklist-items-list .checklist-item");
        for (var i = 0; i < $checklistItemsList.length; ++i) {
            showConvertToCardButton($checklistItemsList.get(i));
        }

        var $checklistEditControls = $(".checklist-item-details .edit-controls");
        if ($checklistEditControls.length > 0) {
            showConvertToCardLink($checklistEditControls.get(0));
        }

        var $listControls = $(".list");
        for (var i = 0; i < $listControls.length; ++i) {
            showCollapseListLink($listControls.get(i));
        }
    }

    var enableAutomaticRenames = true;

    function doRename(card, newName) {
        console.log("Kick off rename of \"" + card.title + "\" => \"" + newName + "\"");
        if (enableAutomaticRenames)
            Trello.put("/card/" + card.shortId + "/name", { "value": newName });
        else
            console.log("/1/card/" + card.shortId + "/name", { "value": newName });
    }

    var lastAttemptedRenameCard;
    var lastAttemptedRenameName = "";
    var lastAttemptedRenameTime = 0;

    function shouldChangeName(card, newName) {
        if (!Trello.authorized()) {
            authorize();
            if (!Trello.authorized())
                return;
        }

        var now = $.now();
        var renameThrottle = (card == lastAttemptedRenameCard && newName == lastAttemptedRenameName) ? (60 * 1000) : 500;

        if (lastAttemptedRenameTime + renameThrottle < now) {
            doRename(card, newName);
            lastAttemptedRenameTime = now;
        } else if (lastAttemptedRenameTime > now) {
            lastAttemptedRenameTime = now; // if now suddenly travels back in time e.g. an hour, clamp us at waiting an additional renameThrottle duration.
        }
        lastAttemptedRenameCard = card;
        lastAttemptedRenameName = newName;
    }

    function onChangesDone() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (card == null)
            return;
        var title = card.title;

        var comments = sumCommentWork();
        var current = parseTitleWork(title);
        if (comments == null)
            return;
        if (current == null)
            return;

        var expected = toTrelloPointsFormat(comments);
        var actual = toTrelloPointsFormat(current);

        if (expected == actual) {
            //console.log( "Expected == actual == ", expected );
        } else {
            var newTitle = stripTitleWork(title) + " " + expected;

            //console.log( "Expected (", expected, ") != actual (", actual, ")" );
            //console.log( "Should rename \"" + title + "\" => \"" + newTitle + "\"" );
            shouldChangeName(card, newTitle);
        }
    }

    var onChanges = $.throttle(200, onChangesImpl);
    var onChangesMaybeDone = $.debounce(2000, onChangesDone);

    var bodyChildrenObserver = new MutationObserver(function (mutations) {
        onChanges();
        onChangesMaybeDone();
    });

    bodyChildrenObserver.observe(document.body, { childList: true, characterData: false, attributes: false, subtree: true });

    function showConvertToCardButton(location) {
        if ($(location).find('.ctcButtonImg').length)
            return;
        if (spamLimit())
            return;

        // Space the checkbox farther from the linkify icon
        $(location).find('.checklist-item-checkbox').css('left', '16px');

        // Add clickable image to linkify checkbox
        $("<img class='ctcButtonImg checklist-item-checkbox' style='left: -12px' src='" + chrome.extension.getURL('images/link.png') + "'>").appendTo(location).click(replaceWithLink);
    }

    function showConvertToCardLink(location) {
        if ($(location).find('.js-convert-item-to-link').length)
            return;
        if (spamLimit())
            return;

        // Add link to checkbox additional options
        $("<a href='#' class='option convert js-convert-item-to-link'>Convert to Link</a>").insertAfter($(location).find('.js-delete-item').get(0)).click(replaceWithLink);
    }

    function showCollapseListLink(location) {
        var $list = $(location);
        if ($list.find('.sigtrello-icon-collapse').length)
            return;
        if (spamLimit())
            return;

        // Add link to list collapse toggle
        $("<a href='#' class='list-header-menu-icon icon-sm sigtrello-icon-collapse dark-hover'></a>").insertAfter($(location).find('.icon-menu').get(0)).click(toggleListCollapse);

        if (CollapseState.isCollapsed($list))
            $list.addClass('sigtrello-collapsed-list');
    }
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=all.js.map
