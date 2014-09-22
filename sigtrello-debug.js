/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
var SigTrello;
(function (SigTrello) {
    function error(message) {
        if (SigTrello.Options.current.option_developer_log_errors)
            alert(message);
    }
    SigTrello.error = error;

    var spamLimitCounter = 100;
    function spamLimit() {
        return SigTrello.Options.current.option_developer_nospam && --spamLimitCounter < 0;
    }
    SigTrello.spamLimit = spamLimit;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-debug.js.map
