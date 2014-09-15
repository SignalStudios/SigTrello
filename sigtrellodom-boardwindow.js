/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='sigtrellodom-common.ts'/>
var SigTrelloDom;
(function (SigTrelloDom) {
    (function (BoardWindow) {
        var Board = (function () {
            function Board(element) {
                this.element = element;
                this._url = window.document.baseURI;
                this._shortId = window.document.baseURI.replace(/^http[s]?:\/\/trello.com\/b\/([^\/]+)\/.*/, "$1");
            }
            Board.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".board-wrapper", "bw-board", function (e) {
                    return new Board(e);
                });
            };
            Board.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".board-wrapper", "bw-board", function (e) {
                    return new Board(e);
                });
            };
            Object.defineProperty(Board, "current", {
                get: function () {
                    var $title = $(".board-header-btn-text");
                    return ($title.length >= 1) ? Board.ownerOf($title.get(0)) : null;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Board.prototype, "url", {
                get: function () {
                    return this._url;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Board.prototype, "shortId", {
                get: function () {
                    return this._shortId;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Board.prototype, "title", {
                get: function () {
                    return $(this.element).find(".board-header-btn-text").text();
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Board.prototype, "lists", {
                get: function () {
                    return List.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            return Board;
        })();
        BoardWindow.Board = Board;

        var List = (function () {
            function List(element) {
                this.element = element;
            }
            List.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".list", "bw-list", function (e) {
                    return new List(e);
                });
            };
            List.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".list", "bw-list", function (e) {
                    return new List(e);
                });
            };

            Object.defineProperty(List.prototype, "displayName", {
                get: function () {
                    return $(this.element).find(".list-header-name").text();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(List.prototype, "cards", {
                get: function () {
                    return Card.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            return List;
        })();
        BoardWindow.List = List;

        var Card = (function () {
            function Card(element) {
                this.element = element;
                this._url = $(this.element).find(".list-card-title").attr("href");
                this._shortId = this._url.replace(/^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/, "$1");
            }
            Card.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".list-card", "bw-card", function (e) {
                    return new Card(e);
                });
            };
            Card.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".list-card", "bw-card", function (e) {
                    return new Card(e);
                });
            };

            Object.defineProperty(Card.prototype, "displayName", {
                get: function () {
                    return $(this.element).find(".list-card-title").contents().last()[0].textContent;
                },
                set: function (value) {
                    $(this.element).find(".list-card-title").contents().last()[0].textContent = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "url", {
                get: function () {
                    return this._url;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "shortId", {
                get: function () {
                    return this._shortId;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Card.prototype, "badges", {
                get: function () {
                    return Badge.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            Card.prototype.addBadge = function (badge) {
                $(this.element).find(".badges").append(badge);
            };
            Card.prototype.removeBadge = function (badge) {
                $(badge.element).remove();
            };
            return Card;
        })();
        BoardWindow.Card = Card;

        var Badge = (function () {
            function Badge(element) {
                this.element = element;
            }
            Badge.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".badge", "bw-badge", function (e) {
                    return new Badge(e);
                });
            };
            Badge.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".badge", "bw-badge", function (e) {
                    return new Badge(e);
                });
            };

            Object.defineProperty(Badge.prototype, "isComments", {
                // Core Trello badge categories
                get: function () {
                    return $(this.element).find(".icon-comment").length > 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Badge.prototype, "isChecklists", {
                get: function () {
                    return $(this.element).find(".icon-checklist").length > 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Badge.prototype, "isAttachments", {
                get: function () {
                    return $(this.element).find(".icon-attachment").length > 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Badge.prototype, "isDescription", {
                get: function () {
                    return $(this.element).find(".icon-desc").length > 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Badge.prototype, "isTrelloScrumPoints", {
                // Other Extension badge categories
                get: function () {
                    return $(this.element).hasClass("badge-points");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Badge.prototype, "isTimeEst", {
                // SigTrello Extension badge categories
                get: function () {
                    return $(this.element).hasClass("sigtrello-time");
                },
                enumerable: true,
                configurable: true
            });
            return Badge;
        })();
        BoardWindow.Badge = Badge;
    })(SigTrelloDom.BoardWindow || (SigTrelloDom.BoardWindow = {}));
    var BoardWindow = SigTrelloDom.BoardWindow;
})(SigTrelloDom || (SigTrelloDom = {}));
//# sourceMappingURL=sigtrellodom-boardwindow.js.map
