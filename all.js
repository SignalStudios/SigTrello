/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
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

    var spamLimitCounter = 1000;
    function spamLimit() {
        //return --limit < 0;
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

    var bodyChildrenObserver = new MutationObserver(function (mutations) {
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

        var p4web = "http://perforce.openwatcom.org:4000";
        if (p4web) {
            var changelistIcon = p4web + "/submittedChangelistIcon?ac=20";
            var changelistUrlPattern = p4web + "/$1?ac=10";
            var changelistDescPattern = "$1";
            replaceWithServiceLinks(/(?:CL|Changelist)[ ]*[#]?[ ]*(\d+)/i, changelistIcon, changelistUrlPattern, changelistDescPattern);
        }
    });

    bodyChildrenObserver.observe(document.body, { childList: true, characterData: false, attributes: false, subtree: true });

    function replaceWithServiceLinks(pattern, iconUrl, linkReplacementPattern, textReplacementPattern) {
        var $where = $(".checklist-item-details-text, .current-comment p, .phenom-desc, .card-detail-item .markeddown p");
        doReplaceWithServiceLinks($where, pattern, iconUrl, linkReplacementPattern, textReplacementPattern);
    }

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
