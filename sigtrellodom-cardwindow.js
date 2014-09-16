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
    (function (CardWindow) {
        var Card = (function () {
            function Card(element) {
                this.element = element;
                this._url = Card.currentUrl;
                this._shortId = Card.currentShortId;
            }
            Object.defineProperty(Card, "urlRegexp", {
                get: function () {
                    return /^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card, "currentUrl", {
                get: function () {
                    var m = Card.urlRegexp.exec(window.document.baseURI);
                    return m ? m[0] : null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card, "currentShortId", {
                get: function () {
                    var m = Card.urlRegexp.exec(window.document.baseURI);
                    return m ? m[1] : null;
                },
                enumerable: true,
                configurable: true
            });

            Card.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".window", "card", function (e) {
                    return new Card(e);
                }, function (c) {
                    return c.shortId != Card.currentShortId;
                });
            };
            Card.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".window", "card", function (e) {
                    return new Card(e);
                }, function (c) {
                    return c.shortId != Card.currentShortId;
                });
            };
            Object.defineProperty(Card, "current", {
                get: function () {
                    var $title = $(".card-detail-title");
                    return ($title.length >= 1) ? Card.ownerOf($title.get(0)) : null;
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
            Object.defineProperty(Card.prototype, "title", {
                get: function () {
                    return $(this.element).find(".window-title-text").text();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "checklists", {
                get: function () {
                    return Checklist.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "members", {
                get: function () {
                    return Member.allUnder($(this.element).find(".card-detail-item-members").get(0));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "labels", {
                get: function () {
                    return Label.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Card.prototype, "comments", {
                get: function () {
                    return Comment.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            return Card;
        })();
        CardWindow.Card = Card;

        var Member = (function () {
            function Member(element) {
                this.element = element;
            }
            Member.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".member", "member", function (e) {
                    return new Member(e);
                });
            };
            Member.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".member", "member", function (e) {
                    return new Member(e);
                });
            };

            Object.defineProperty(Member.prototype, "avatarUrl", {
                get: function () {
                    return $(this.element).find(".member-avatar").attr("src");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Member.prototype, "displayName", {
                get: function () {
                    return $(this.element).find(".member-avatar").attr("title").replace(/^(.+)\((.+?)\)$/, "$1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Member.prototype, "id", {
                //public get id( )			: string { return $(this.element).find( ".member-avatar" ).attr("title").replace( /^(.+)\((.+?)\)$/, "$2" ); }
                get: function () {
                    return $(this.element).attr("data-idmem");
                },
                enumerable: true,
                configurable: true
            });
            return Member;
        })();
        CardWindow.Member = Member;

        var Label = (function () {
            function Label(element) {
                this.element = element;
            }
            Label.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".card-label", "label", function (e) {
                    return new Label(e);
                });
            };
            Label.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".card-label", "label", function (e) {
                    return new Label(e);
                });
            };

            Object.defineProperty(Label.prototype, "colorLabelClass", {
                get: function () {
                    return $(this.element).attr("class").split(" ").filter(function (s) {
                        return s.indexOf("card-label-") == 0;
                    })[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Label.prototype, "color", {
                get: function () {
                    return this.colorLabelClass.replace(/^card-label-/, "");
                },
                enumerable: true,
                configurable: true
            });
            return Label;
        })();
        CardWindow.Label = Label;

        var Comment = (function () {
            function Comment(element) {
                this.element = element;
            }
            Comment.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".phenom-comment", "comment", function (e) {
                    return new Comment(e);
                });
            };
            Comment.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".phenom-comment", "comment", function (e) {
                    return new Comment(e);
                });
            };

            Object.defineProperty(Comment.prototype, "creatorAvatarUrl", {
                get: function () {
                    return $(this.element).find(".creator .member-avatar").attr("src");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Comment.prototype, "creatorDisplayName", {
                get: function () {
                    return $(this.element).find(".creator .member-avatar").attr("title").replace(/^(.+)\((.+?)\)$/, "$1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Comment.prototype, "body", {
                //public get creatorId( )			: string { return $(this.element).find( ".creator .member-avatar" ).attr("title").replace( /^(.+)\((.+?)\)$/, "$2" ); }
                get: function () {
                    return $(this.element).find(".action-comment p");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Comment.prototype, "timestamp", {
                get: function () {
                    return $(this.element).find(".phenom-meta .date").attr("dt");
                },
                enumerable: true,
                configurable: true
            });
            return Comment;
        })();
        CardWindow.Comment = Comment;

        var Checklist = (function () {
            function Checklist(element) {
                this.element = element;
            }
            Checklist.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".checklist", "checklist", function (e) {
                    return new Checklist(e);
                });
            };
            Checklist.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".checklist", "checklist", function (e) {
                    return new Checklist(e);
                });
            };

            Object.defineProperty(Checklist.prototype, "items", {
                get: function () {
                    return ChecklistItem.allUnder(this.element);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Checklist.prototype, "card", {
                get: function () {
                    return Card.current;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Checklist.prototype, "displayTitle", {
                get: function () {
                    return $(this.element).find('.checklist-title h3').text();
                },
                set: function (value) {
                    if (this.displayTitle != value)
                        $(this.element).find('.checklist-title h3').text(value);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Checklist.prototype, "title", {
                get: function () {
                    return this.displayTitle;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Checklist.prototype, "index", {
                get: function () {
                    return this.card.checklists.indexOf(this);
                },
                enumerable: true,
                configurable: true
            });
            return Checklist;
        })();
        CardWindow.Checklist = Checklist;

        var ChecklistItem = (function () {
            function ChecklistItem(element) {
                this.element = element;
            }
            ChecklistItem.ownerOf = function (e) {
                return SigTrelloDom.ownerOf(e, ".checklist-item", "checklist-item", function (e) {
                    return new ChecklistItem(e);
                });
            };
            ChecklistItem.allUnder = function (e) {
                return SigTrelloDom.allUnder(e, ".checklist-item", "checklist-item", function (e) {
                    return new ChecklistItem(e);
                });
            };

            Object.defineProperty(ChecklistItem.prototype, "checklist", {
                get: function () {
                    return Checklist.ownerOf(this.element);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ChecklistItem.prototype, "textDisplayed", {
                get: function () {
                    return $(this.element).find('.checklist-item-details-text').text();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ChecklistItem.prototype, "textEntered", {
                get: function () {
                    return this.getFlatName($(this.element).find('.checklist-item-details-text'));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ChecklistItem.prototype, "index", {
                get: function () {
                    return this.checklist.items.indexOf(this);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ChecklistItem.prototype, "isAllOneUrl", {
                get: function () {
                    var $text = $(this.element).find('.checklist-item-details-text');
                    var $links = $(this.element).find('.checklist-item-details-text').find('a');
                    return ($links.length == 1) && ($links.text() == $text.text());
                },
                enumerable: true,
                configurable: true
            });

            ChecklistItem.prototype.getFlatName = function ($node) {
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
            };
            return ChecklistItem;
        })();
        CardWindow.ChecklistItem = ChecklistItem;
    })(SigTrelloDom.CardWindow || (SigTrelloDom.CardWindow = {}));
    var CardWindow = SigTrelloDom.CardWindow;
})(SigTrelloDom || (SigTrelloDom = {}));
//# sourceMappingURL=sigtrellodom-cardwindow.js.map
