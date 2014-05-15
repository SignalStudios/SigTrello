 /*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>

module SigTrelloDom {
	function getOrCreateCached<T>( element : Element, cacheId : string, create : ( element : Element ) => T ) {
		var cached : T = element[cacheId];
		if( cached == null )
			element[cacheId] = cached = create( element );
		return cached;
	}

	function ownerOf<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T ) : T {
		return getOrCreateCached( $(element).parents(selector).get(0), cacheId, create );
	}

	function allUnder<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T ) : T[] {
		return $(element).find(selector).map( (index,childElement) => {
			return getOrCreateCached( childElement, cacheId, create );
		}).toArray( );
	}

	export module CardWindow {
		export class Card {
			constructor( public element : Element ) {
				this._url		= window.document.baseURI;
				this._shortId	= window.document.baseURI.replace( /^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/, "$1" );
			}

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".window", "card", (e) => new Card(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".window", "card", (e) => new Card(e) ); }
			public static get current( ) { var $title = $(".card-detail-title"); return ($title.length >= 1) ? Card.ownerOf( $title.get(0) ) : null; }

			public get url( )		: string		{ return this._url; }
			public get shortId( )	: string		{ return this._shortId; } // Parse "mbdChsJG" out of "https://trello.com/c/mbdChsJG/185-test"
			public get checklists( ): Checklist[]	{ return Checklist.allUnder( this.element ); }

			private _url			: string;
			private _shortId		: string;
		}

		export class Checklist {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".checklist", "checklist", (e) => new Checklist(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".checklist", "checklist", (e) => new Checklist(e) ); }

			public get items( )	: ChecklistItem[]	{ return ChecklistItem.allUnder( this.element ); }
			public get card( )	: Card				{ return Card.current; }
			public get title( )	: string			{ return $(this.element).find('.checklist-title h3').text( ); }
			public get index( )	: number			{ return this.card.checklists.indexOf(this); }
		}

		export class ChecklistItem {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".checklist-item", "checklist-item", (e) => new ChecklistItem(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".checklist-item", "checklist-item", (e) => new ChecklistItem(e) ); }

			public get checklist( )		: Checklist	{ return Checklist.ownerOf( this.element ); }
			public get textDisplayed( )	: string	{ return $(this.element).find('.checklist-item-details-text').text(); }
			public get textEntered( )	: string	{ return this.getFlatName( $(this.element).find('.checklist-item-details-text') ); }
			public get index( )			: number	{ return this.checklist.items.indexOf(this); }
			public get isAllOneUrl( )		: boolean	{
				var $text	= $(this.element).find('.checklist-item-details-text');
				var $links	= $(this.element).find('.checklist-item-details-text').find('a');
				return ( $links.length == 1 ) && ( $links.text() == $text.text() );
			}

			private getFlatName( $node : JQuery ) : string {
				var $elements = $node.contents( );
				var s = "";
				for( var i = 0; i < $elements.length; ++i ) {
					var element = $elements.get(i);
					if( element.nodeName == 'A' ) {
						s += $(element).attr("href");
					} else {
						s += $(element).text( );
					}
				}
				return s;
			}
		}
	}
}