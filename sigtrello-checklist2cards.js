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
///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrello-core.ts'/>
///<reference path='sigtrello-dom-card-window.ts'/>
var SigTrello;
(function (SigTrello) {
    function replaceWithLink() {
        var toLink = this;
        if (!Trello.authorized()) {
            SigTrello.authorize();
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
                var cardChecklist = SigTrello.getBestByNameIndex(checklist.title, checklist.index, cardInfo);
                if (cardChecklist == null) {
                    SigTrello.error("Checklist ambiguous or missing!");
                    return;
                }

                var cardChecklistItem = SigTrello.getBestByNameIndex(checklistItem.textEntered, checklistItem.index, cardChecklist.checkItems);
                if (cardChecklistItem == null) {
                    SigTrello.error("Checklist item ambiguous or missing!");
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

    function showConvertToCardButton(location) {
        if ($(location).find('.ctcButtonImg').length)
            return;
        if (SigTrello.spamLimit())
            return;

        // Space the checkbox farther from the linkify icon
        $(location).find('.checklist-item-checkbox').css('left', '16px');

        // Add clickable image to linkify checkbox
        $("<img class='ctcButtonImg checklist-item-checkbox' style='left: -12px' src='" + chrome.extension.getURL('images/link.png') + "'>").appendTo(location).click(replaceWithLink);
    }
    SigTrello.showConvertToCardButton = showConvertToCardButton;

    function showConvertToCardLink(location) {
        if ($(location).find('.js-convert-item-to-link').length)
            return;
        if (SigTrello.spamLimit())
            return;

        // Add link to checkbox additional options
        $("<a href='#' class='option convert js-convert-item-to-link'>Convert to Link</a>").insertAfter($(location).find('.js-delete-item').get(0)).click(replaceWithLink);
    }
    SigTrello.showConvertToCardLink = showConvertToCardLink;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-checklist2cards.js.map
