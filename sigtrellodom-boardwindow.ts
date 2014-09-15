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

module SigTrelloDom {
	export module BoardWindow {
		export class Board {
			constructor( public element : Element ) {
				this._url		= window.document.baseURI;
				this._shortId	= window.document.baseURI.replace( /^http[s]?:\/\/trello.com\/b\/([^\/]+)\/.*/, "$1" );
			}

			public static ownerOf	( e : Element )	{ return ownerOf	( e, ".board-wrapper", "bw-board", (e) => new Board(e) ); }
			public static allUnder	( e : Element )	{ return allUnder	( e, ".board-wrapper", "bw-board", (e) => new Board(e) ); }
			public static get current( ) : Board	{ var $title = $(".board-header-btn-text"); return ($title.length >= 1) ? Board.ownerOf( $title.get(0) ) : null; }

			public get url( )		: string		{ return this._url; }
			public get shortId( )	: string		{ return this._shortId; }
			public get title( )		: string		{ return $(this.element).find(".board-header-btn-text").text( ); }

			public get lists( )		: List[]		{ return List.allUnder( this.element ); }

			private _url			: string;
			private _shortId		: string;
		}

		export class List {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element )	{ return ownerOf	( e, ".list", "bw-list", (e) => new List(e) ); }
			public static allUnder	( e : Element )	{ return allUnder	( e, ".list", "bw-list", (e) => new List(e) ); }

			public get displayName( ) : string		{ return $(this.element).find( ".list-header-name" ).text( ); }
			public get cards( ) : Card[]			{ return Card.allUnder( this.element ); }
		}

		export class Card {
			constructor( public element : Element ) {
				this._url		= $(this.element).find(".list-card-title").attr( "href" );
				this._shortId	= this._url.replace( /^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/, "$1" );
			}

			public static ownerOf	( e : Element )		{ return ownerOf	( e, ".list-card", "bw-card", (e) => new Card(e) ); }
			public static allUnder	( e : Element )		{ return allUnder	( e, ".list-card", "bw-card", (e) => new Card(e) ); }

			public get displayName( ) : string			{ return $(this.element).find( ".list-card-title" ).contents( ).last( )[0].textContent; }
			public set displayName( value : string )	{ $(this.element).find( ".list-card-title" ).contents( ).last( )[0].textContent = value; }
			public get url( ) : string					{ return this._url; }
			public get shortId( ) : string				{ return this._shortId; }

			public get badges( )	: Badge[]			{ return Badge.allUnder( this.element ); }
			public addBadge( badge )					{ $(this.element).find(".badges").append( badge ); }
			public removeBadge( badge : Badge )			{ $(badge.element).remove(); }

			private _url			: string;
			private _shortId		: string;
		}

		export class Badge {
			constructor( public element : Element ) { }

			public static ownerOf	( e : Element ) { return ownerOf	( e, ".badge", "bw-badge", (e) => new Badge(e) ); }
			public static allUnder	( e : Element ) { return allUnder	( e, ".badge", "bw-badge", (e) => new Badge(e) ); }

			// Core Trello badge categories
			public get isComments( )			: boolean { return $(this.element).find( ".icon-comment" )		.length > 0; }
			public get isChecklists( )			: boolean { return $(this.element).find( ".icon-checklist" )	.length > 0; }
			public get isAttachments( )			: boolean { return $(this.element).find( ".icon-attachment" )	.length > 0; }
			public get isDescription( )			: boolean { return $(this.element).find( ".icon-desc" )			.length > 0; }

			// Other Extension badge categories
			public get isTrelloScrumPoints( )	: boolean { return $(this.element).hasClass( "badge-points" ); }

			// SigTrello Extension badge categories
			public get isTimeEst( )				: boolean { return $(this.element).hasClass( "sigtrello-time" ); }
		}
	}
}
