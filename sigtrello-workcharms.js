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
///<reference path='sigtrellodom-boardwindow.ts'/>
var SigTrello;
(function (SigTrello) {
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

    function showTitleWorkCharms() {
        var board = SigTrelloDom.BoardWindow.Board.current;
        if (!board)
            return;

        board.lists.forEach(function (list) {
            list.cards.forEach(function (card) {
                // ...
                // Add work badge
            });
        });

        var $list = $(location);
        if ($list.find('.sigtrello-icon-collapse').length)
            return;
        if (SigTrello.spamLimit())
            return;

        // Add link to list collapse toggle
        $("<a href='#' class='list-header-menu-icon icon-sm sigtrello-icon-collapse dark-hover'></a>").insertAfter($(location).find('.icon-menu').get(0)).click(toggleListCollapse);

        if (CollapseState.isCollapsed($list))
            $list.addClass('sigtrello-collapsed-list');
    }
    SigTrello.showTitleWorkCharms = showTitleWorkCharms;
})(SigTrello || (SigTrello = {}));
//# sourceMappingURL=sigtrello-workcharms.js.map
