/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='sigtrello-all.ts'/>
///<reference path='chrome.d.ts'/>
var SigTrello;
(function (SigTrello) {
    (function (Options) {
        var defaults = {
            option_display_workbadge_enable: true,
            option_display_listcollapse_enable: true,
            option_display_p4weblinks_enable: true,
            option_display_checklist2cards_enable: true,
            option_actions_worksum_enable: true,
            option_display_workbadge_text: SigTrello.WorkFormat[1 /* Badge_WorkOfCurrent */],
            //option_display_workbadge_background:	true,
            option_display_p4web_rooturl: "http://perforce.openwatcom.org:4000",
            option_developer_nospam: false,
            option_developer_log_errors: false
        };

        function clone(data) {
            return JSON.parse(JSON.stringify(data));
        }

        Options.current = clone(defaults);

        function save() {
            Options.current.option_actions_worksum_enable = $("#option-actions-worksum-enable").prop("checked");
            Options.current.option_developer_log_errors = $("#option-developer-log-errors").prop("checked");
            Options.current.option_developer_nospam = $("#option-developer-nospam").prop("checked");
            Options.current.option_display_checklist2cards_enable = $("#option-display-checklist2cards-enable").prop("checked");
            Options.current.option_display_listcollapse_enable = $("#option-display-listcollapse-enable").prop("checked");
            Options.current.option_display_p4web_rooturl = $("#option-display-p4web-rooturl").val();
            Options.current.option_display_p4weblinks_enable = $("#option-display-p4weblinks-enable").prop("checked");
            Options.current.option_display_workbadge_enable = $("#option-display-workbadge-enable").prop("checked");
            Options.current.option_display_workbadge_text = $("#option-display-workbadge-text").prop("value");
            console.log(Options.current);

            chrome.storage.sync.set(Options.current, function () {
            });
        }
        Options.save = save;

        function load() {
            chrome.storage.sync.get(defaults, function (newData) {
                Options.current = newData;
                SigTrello.main();
                $("#action-settings-save").on("click", save);
            });
        }
        Options.load = load;

        load();
    })(SigTrello.Options || (SigTrello.Options = {}));
    var Options = SigTrello.Options;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-options.js.map
