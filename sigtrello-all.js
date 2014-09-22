/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='jquery-ba-throttle-debounce.d.ts'/>
///<reference path='sigtrello-checklist2cards.ts'/>
///<reference path='sigtrello-collapselists.ts'/>
///<reference path='sigtrello-options.ts'/>
var SigTrello;
(function (SigTrello) {
    function onChangesImpl() {
        if (SigTrello.Options.current.option_display_checklist2cards_enable) {
            var $checklistItemsList = $(".checklist-items-list .checklist-item");
            for (var i = 0; i < $checklistItemsList.length; ++i) {
                SigTrello.showConvertToCardButton($checklistItemsList.get(i));
            }

            var $checklistEditControls = $(".checklist-item-details .edit-controls");
            if ($checklistEditControls.length > 0) {
                SigTrello.showConvertToCardLink($checklistEditControls.get(0));
            }
        }

        if (SigTrello.Options.current.option_display_listcollapse_enable) {
            var $listControls = $(".list");
            for (var i = 0; i < $listControls.length; ++i) {
                SigTrello.showCollapseListLink($listControls.get(i));
            }
        }

        if (SigTrello.Options.current.option_actions_worksum_enable) {
            SigTrello.sumChecklistTimes();
        }

        if (SigTrello.Options.current.option_display_p4weblinks_enable) {
            var p4web = SigTrello.Options.current.option_display_p4web_rooturl;
            if (p4web) {
                var changelistIcon = p4web + "/submittedChangelistIcon?ac=20";
                var changelistUrlPattern = p4web + "/$1?ac=10";
                var changelistDescPattern = "$1";
                SigTrello.replaceWithServiceLinks(/(?:CL|Changelist)[ ]*[#]?[ ]*(\d+)/i, changelistIcon, changelistUrlPattern, changelistDescPattern);
            }
        }

        if (SigTrello.Options.current.option_display_workbadge_enable) {
            SigTrello.showTitleWorkBadges();
        }
    }

    var onChanges = $.throttle(200, onChangesImpl);

    var bodyChildrenObserver = new MutationObserver(function (mutations) {
        onChanges();
        SigTrello.onChangesMaybeDone();
    });

    function main() {
        bodyChildrenObserver.observe(document.body, { childList: true, characterData: false, attributes: false, subtree: true });
    }
    SigTrello.main = main;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-all.js.map
