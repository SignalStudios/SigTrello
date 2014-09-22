/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
var SigTrello;
(function (SigTrello) {
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
    SigTrello.parseTitleWork = parseTitleWork;

    function parseTitleWorkOrBadge(title, element) {
        var parsed = parseTitleWork(title);
        if (parsed)
            return parsed;

        var badge = $(element).find('.sigtrello-time');
        for (var i = 0; i < badge.length; ++i) {
            return $(badge[i]).data('sigtrello-work');
        }

        return null;
    }
    SigTrello.parseTitleWorkOrBadge = parseTitleWorkOrBadge;

    function stripTitleWork(title) {
        title = title.replace(/\s*\((\d*\.?\d*)\)\s*/i, "");
        title = title.replace(/\s*\[(\d*\.?\d*)\]\s*/i, "");
        title = title.replace(/\s*\{(\d*\.?\d*)\}\s*/i, "");
        return title;
    }
    SigTrello.stripTitleWork = stripTitleWork;

    function equalWork(lhs, rhs) {
        return lhs.original == rhs.original && lhs.remaining == rhs.remaining && lhs.worked == rhs.worked;
    }
    SigTrello.equalWork = equalWork;

    function sumWork(works) {
        var sum = { "original": 0.0, "remaining": 0.0, "worked": 0.0 };

        var foundAny = false;
        for (var i = 0; i < works.length; ++i) {
            var work = works[i];
            if (!work)
                continue;

            foundAny = true;
            sum.original += work.original;
            sum.remaining += work.remaining;
            sum.worked += work.worked;
        }

        return foundAny ? sum : null;
    }
    SigTrello.sumWork = sumWork;

    function toTrelloPointsNumber3(n) {
        var digits = (Math.abs(n) < 10.0) ? n.toFixed(2) : (Math.abs(n) < 100.0) ? n.toFixed(1) : n.toFixed(0);

        return /^(\d+\.??\d*?)\.?0*$/.exec(digits)[1];
    }
    SigTrello.toTrelloPointsNumber3 = toTrelloPointsNumber3;

    function toTrelloPointsFormat3(work) {
        return "(" + toTrelloPointsNumber3(work.original) + ") [" + toTrelloPointsNumber3(work.worked) + "] {" + toTrelloPointsNumber3(work.remaining) + "}";
    }
    SigTrello.toTrelloPointsFormat3 = toTrelloPointsFormat3;

    function toTrelloPointsNumber2(n) {
        var digits = (Math.abs(n) < 10.0) ? n.toFixed(1) : n.toFixed(0);

        return /^(\d+\.??\d*?)\.?0*$/.exec(digits)[1];
    }
    SigTrello.toTrelloPointsNumber2 = toTrelloPointsNumber2;

    (function (WorkFormat) {
        WorkFormat[WorkFormat["RawTitle"] = 0] = "RawTitle";

        WorkFormat[WorkFormat["Badge_WorkOfCurrent"] = 1] = "Badge_WorkOfCurrent";
        WorkFormat[WorkFormat["Badge_WorkOfOriginal"] = 2] = "Badge_WorkOfOriginal";
        WorkFormat[WorkFormat["Badge_RemainingOfCurrent"] = 3] = "Badge_RemainingOfCurrent";
        WorkFormat[WorkFormat["Badge_RemainingOfOriginal"] = 4] = "Badge_RemainingOfOriginal";

        WorkFormat[WorkFormat["Badge_LongDescription"] = 5] = "Badge_LongDescription";
    })(SigTrello.WorkFormat || (SigTrello.WorkFormat = {}));
    var WorkFormat = SigTrello.WorkFormat;

    function toTrelloPoints(format, work) {
        switch (format) {
            case 0 /* RawTitle */:
                return "(" + toTrelloPointsNumber3(work.original) + ") [" + toTrelloPointsNumber3(work.worked) + "] {" + toTrelloPointsNumber3(work.remaining) + "}";

            case 1 /* Badge_WorkOfCurrent */:
                return toTrelloPointsNumber2(work.worked) + "/" + toTrelloPointsNumber2(work.remaining + work.worked) + "h";
            case 2 /* Badge_WorkOfOriginal */:
                return toTrelloPointsNumber2(work.worked) + "/" + toTrelloPointsNumber2(work.original) + "h";
            case 3 /* Badge_RemainingOfCurrent */:
                return toTrelloPointsNumber2(work.remaining) + "/" + toTrelloPointsNumber2(work.remaining + work.worked) + "h";
            case 4 /* Badge_RemainingOfOriginal */:
                return toTrelloPointsNumber2(work.remaining) + "/" + toTrelloPointsNumber2(work.original) + "h";

            case 5 /* Badge_LongDescription */:
                return "This card has " + work.worked + "h of " + work.original + "h completed, " + work.remaining + "h remaining";

            default:
                SigTrello.error("Invalid WorkFormat");
                return null;
        }
    }
    SigTrello.toTrelloPoints = toTrelloPoints;

    function isWorkComplete(work) {
        return work.remaining <= 0;
    }
    SigTrello.isWorkComplete = isWorkComplete;

    function toTrelloPointsBadgeFormat(work) {
    }
    SigTrello.toTrelloPointsBadgeFormat = toTrelloPointsBadgeFormat;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-workparse.js.map
