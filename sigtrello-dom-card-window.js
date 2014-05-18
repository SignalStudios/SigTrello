/*!
* SigTrello
*
* Copyright (C) 2014 Signal Studios
* Released under the MIT license
* See LICENSE.txt
*/
///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>
var SigTrelloDom;
(function (SigTrelloDom) {
    function getOrCreateCached(element, cacheId, create) {
        var cached = element[cacheId];
        if (cached == null)
            element[cacheId] = cached = create(element);
        return cached;
    }

    function ownerOf(element, selector, cacheId, create) {
        return getOrCreateCached($(element).parents(selector).get(0), cacheId, create);
    }

    function allUnder(element, selector, cacheId, create) {
        return $(element).find(selector).map(function (index, childElement) {
            return getOrCreateCached(childElement, cacheId, create);
        }).toArray();
    }

    (function (CardWindow) {
        var Card = (function () {
            function Card(element) {
                this.element = element;
                this._url = window.document.baseURI;
                this._shortId = window.document.baseURI.replace(/^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/, "$1");
            }
            Card.ownerOf = function (e) {
                return ownerOf(e, ".window", "card", function (e) {
                    return new Card(e);
                });
            };
            Card.allUnder = function (e) {
                return allUnder(e, ".window", "card", function (e) {
                    return new Card(e);
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
            return Card;
        })();
        CardWindow.Card = Card;

        var Member = (function () {
            function Member(element) {
                this.element = element;
            }
            Member.ownerOf = function (e) {
                return ownerOf(e, ".member", "member", function (e) {
                    return new Member(e);
                });
            };
            Member.allUnder = function (e) {
                return allUnder(e, ".member", "member", function (e) {
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
                return ownerOf(e, ".card-label", "label", function (e) {
                    return new Label(e);
                });
            };
            Label.allUnder = function (e) {
                return allUnder(e, ".card-label", "label", function (e) {
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

        var Checklist = (function () {
            function Checklist(element) {
                this.element = element;
            }
            Checklist.ownerOf = function (e) {
                return ownerOf(e, ".checklist", "checklist", function (e) {
                    return new Checklist(e);
                });
            };
            Checklist.allUnder = function (e) {
                return allUnder(e, ".checklist", "checklist", function (e) {
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
            Object.defineProperty(Checklist.prototype, "title", {
                get: function () {
                    return $(this.element).find('.checklist-title h3').text();
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
                return ownerOf(e, ".checklist-item", "checklist-item", function (e) {
                    return new ChecklistItem(e);
                });
            };
            ChecklistItem.allUnder = function (e) {
                return allUnder(e, ".checklist-item", "checklist-item", function (e) {
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
//# sourceMappingURL=sigtrello-dom-card-window.js.map
