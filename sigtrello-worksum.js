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
///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrello-workparse.ts'/>
///<reference path='sigtrellodom-cardwindow.ts'/>
var SigTrello;
(function (SigTrello) {
    var enableAutomaticRenames = true;

    function sumChecklistWork() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (!card || SigTrello.spamLimit())
            return null;

        var works = [];

        card.checklists.forEach(function (checklist) {
            checklist.items.forEach(function (checkitem) {
                var parsed = SigTrello.parseTitleWork(checkitem.textDisplayed);
                if (parsed) {
                    works.push(parsed);
                    return;
                }

                var badge = $(checkitem.element).find('.sigtrello-time');
                for (var i = 0; i < badge.length; ++i) {
                    works.push($(badge[i]).data('sigtrello-work'));
                }
            });
        });

        return works.length > 0 ? SigTrello.sumWork(works) : null;
    }

    function sumCommentWork() {
        var card = SigTrelloDom.CardWindow.Card.current;
        if (!card || SigTrello.spamLimit())
            return null;

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
        if (!SigTrello.authorize())
            return;
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
        var checklists = sumChecklistWork();
        var sumFound = SigTrello.sumWork([comments, checklists]);

        var current = SigTrello.parseTitleWork(title);
        if (sumFound == null)
            return;
        if (current == null)
            return;

        var format = 0 /* RawTitle */;
        var expected = SigTrello.toTrelloPoints(format, sumFound);
        var actual = SigTrello.toTrelloPoints(format, current);

        if (expected == actual) {
            //console.log( "Expected == actual == ", expected );
        } else {
            var newTitle = SigTrello.stripTitleWork(title) + " " + expected;

            //console.log( "Expected (", expected, ") != actual (", actual, ")" );
            //console.log( "Should rename \"" + title + "\" => \"" + newTitle + "\"" );
            shouldChangeName(card, newTitle);
        }
    }
    SigTrello.onChangesDone = onChangesDone;

    SigTrello.onChangesMaybeDone = $.debounce(2000, onChangesDone);
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-worksum.js.map
