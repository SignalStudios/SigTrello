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
        //alert( message );
    }
    SigTrello.error = error;

    var spamLimitCounter = 100;
    function spamLimit() {
        //return --spamLimitCounter < 0;
        return false;
    }
    SigTrello.spamLimit = spamLimit;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-debug.js.map
