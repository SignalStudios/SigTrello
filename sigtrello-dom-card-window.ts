﻿ /*!
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
			public get members( )	: Member[]		{ return Member.allUnder( $(this.element).find(".card-detail-item-members").get(0) ); }
			public get labels( )	: Label[]		{ return Label.allUnder( this.element ); }

			private _url			: string;
			private _shortId		: string;
		}

		export class Member {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".member", "member", (e) => new Member(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".member", "member", (e) => new Member(e) ); }

			public get avatarUrl( )		: string { return $(this.element).find( ".member-avatar" ).attr("src"); }
			public get displayName( )	: string { return $(this.element).find( ".member-avatar" ).attr("title").replace( /^(.+)\((.+?)\)$/, "$1" ); }
			//public get id( )			: string { return $(this.element).find( ".member-avatar" ).attr("title").replace( /^(.+)\((.+?)\)$/, "$2" ); }
			public get id( )			: string { return $(this.element).attr( "data-idmem" ); }
		}

		export class Label {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".card-label", "label", (e) => new Label(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".card-label", "label", (e) => new Label(e) ); }

			public get colorLabelClass( )	: string { return $(this.element).attr("class").split(" ").filter( (s) => s.indexOf("card-label-") == 0 )[0]; }
			public get color( )				: string { return this.colorLabelClass.replace( /^card-label-/, "" ); }
		}

		export class Checklist {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".checklist", "checklist", (e) => new Checklist(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".checklist", "checklist", (e) => new Checklist(e) ); }

			public get items( )	: ChecklistItem[]		{ return ChecklistItem.allUnder( this.element ); }
			public get card( )	: Card					{ return Card.current; }
			public get displayTitle( ) : string			{ return $(this.element).find('.checklist-title h3').text( ); }
			public set displayTitle( value : string )	{ if( this.displayTitle != value ) $(this.element).find('.checklist-title h3').text( value ); }
			public get title( )	: string				{ return this.displayTitle; }
			public get index( )	: number				{ return this.card.checklists.indexOf(this); }
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