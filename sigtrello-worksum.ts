/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='jquery-ba-throttle-debounce.d.ts'/>
///<reference path='trello-client.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>
///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrellodom-cardwindow.ts'/>

module SigTrello {
	var enableAutomaticRenames = true;

	interface IWork {
		original:	number;
		remaining:	number;
		worked:		number;
	}

	function sumCommentWork( ) : IWork {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( !card ) return; // Don't sum until we can
		if( spamLimit( ) ) return;

		var estOriginal		: number = undefined;
		var estRemaining	: number = 0.0;
		var estWorked		: number = 0.0;

		var pattern = /(work|worked|estimate|estimated)\s+([=+-])?(\d+\.?\d*|\d*\.?\d+)([wdhm])/gi;
		var scale = { "w": 40, "d": 8, "h": 1, "m": 1.0/60 };

		var foundAnyWork = false;

		card.comments.reverse().forEach( (comment) => {
			for( var match : RegExpExecArray; (match = pattern.exec( comment.body.text( ) )) !== null; ) {
				var action				: string = match[1].toLowerCase();
				var adjustmentType		: string = match[2];
				var adjustmentValue		: number = parseFloat( match[3] );
				var adjustmentUnit		: string = match[4].toLowerCase();
				//console.log( "Action: ", action, " ", adjustmentType, adjustmentValue, adjustmentUnit );

				adjustmentValue *= scale[adjustmentUnit];

				foundAnyWork = true;

				switch( match[1].toLowerCase() ) {
				case "work":
				case "worked":
					switch( adjustmentType ) {
					case undefined:
					case "+":
						estWorked += adjustmentValue;
						estRemaining -= adjustmentValue;
						if( estRemaining < 0 )
							estRemaining = 0;
						break;
					case "-":
						estWorked -= adjustmentValue;
						estRemaining += adjustmentValue;
						break;
					case "=":
						estRemaining += (adjustmentValue - estWorked);
						estWorked = adjustmentValue;
						break;
					}
					break;

				case "estimate":
				case "estimated":
					switch( adjustmentType ) {
					case "+":
						estRemaining += adjustmentValue;
						break;
					case "-":
						estRemaining -= adjustmentValue;
						if( estRemaining < 0 )
							estRemaining = 0;
						break;
					case undefined:
					case "=":
						estRemaining = adjustmentValue;
						break;
					}

					if( estOriginal === undefined )
						estOriginal = estRemaining + estWorked;
					break;
				}
			}
		});

		if( estOriginal === undefined )
			estOriginal = 0.0;

		return foundAnyWork ? { "original": estOriginal, "remaining": estRemaining, "worked": estWorked } : null;
	}

	function parseTitleWork( title : string ) : IWork {
		if( !title )
			return null;

		var matchOriginal	= /\((\d*\.?\d*)\)/gi.exec( title );
		var matchWorked		= /\[(\d*\.?\d*)\]/gi.exec( title );
		var matchRemaining	= /\{(\d*\.?\d*)\}/gi.exec( title );

		//console.log( title, matchOriginal, matchWorked, matchRemaining );

		if( matchOriginal || matchWorked || matchRemaining ) {
			var estOriginal	: number = matchOriginal	? parseFloat( matchOriginal[1]	) : 0.0;
			var estWorked	: number = matchWorked		? parseFloat( matchWorked[1]	) : 0.0;
			var estRemaining: number = matchRemaining	? parseFloat( matchRemaining[1]	) : Math.max( estOriginal - estWorked, 0.0 );

			return { "original": estOriginal, "remaining": estRemaining, "worked": estWorked };
		} else {
			return null;
		}
	}

	function stripTitleWork( title : string ) : string {
		title = title.replace( /\s*\((\d*\.?\d*)\)\s*/i, "" );
		title = title.replace( /\s*\[(\d*\.?\d*)\]\s*/i, "" );
		title = title.replace( /\s*\{(\d*\.?\d*)\}\s*/i, "" );
		return title;
	}

	function sumWork( works : IWork[] ) : IWork {
		var sum = { "original": 0.0, "remaining": 0.0, "worked": 0.0 };

		for( var i = 0; i < works.length; ++i ) {
			var work = works[i];
			sum.original	+= work.original;
			sum.remaining	+= work.remaining;
			sum.worked		+= work.worked;
		}

		return sum;
	}

	function toTrelloPointsNumber( n : number ) {
		var digits = (Math.abs( n ) < 10.0) ? n.toFixed(2)
			: (Math.abs( n ) < 100.0) ? n.toFixed(1)
			: n.toFixed(0);

		return /^(\d+\.??\d*?)\.?0*$/.exec( digits )[1];
	}

	function toTrelloPointsFormat( work : IWork ) {
		return "(" + toTrelloPointsNumber( work.original ) + ") [" + toTrelloPointsNumber( work.worked ) + "] {" + toTrelloPointsNumber( work.remaining ) + "}";
	}

	function doRename( card : SigTrelloDom.CardWindow.Card, newName : string ) {
		console.log( "Kick off rename of \"" + card.title + "\" => \"" + newName + "\"" );
		if( enableAutomaticRenames )
			Trello.put( "/card/"+card.shortId+"/name", { "value": newName } );
		else
			console.log( "/1/card/"+card.shortId+"/name", { "value": newName } );
	}

	var lastAttemptedRenameCard : SigTrelloDom.CardWindow.Card;
	var lastAttemptedRenameName : string = "";
	var lastAttemptedRenameTime : number = 0;

	function shouldChangeName( card : SigTrelloDom.CardWindow.Card, newName : string ) {
		if( !Trello.authorized() ) {
			authorize( );
			if( !Trello.authorized() )
				return;
		}

		var now = $.now( );
		var renameThrottle = ( card == lastAttemptedRenameCard && newName == lastAttemptedRenameName ) ? (60 * 1000) : 500;

		if( lastAttemptedRenameTime + renameThrottle < now ) {
			doRename( card, newName );
			lastAttemptedRenameTime = now;
		} else if( lastAttemptedRenameTime > now ) {
			lastAttemptedRenameTime = now; // if now suddenly travels back in time e.g. an hour, clamp us at waiting an additional renameThrottle duration.
		}
		lastAttemptedRenameCard = card;
		lastAttemptedRenameName = newName;
	}

	export function onChangesDone( ) {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( card == null ) return;
		var title = card.title;

		var comments = sumCommentWork( );
		var current = parseTitleWork( title );
		if( comments == null ) return;
		if( current == null ) return;

		var expected = toTrelloPointsFormat( comments );
		var actual = toTrelloPointsFormat( current );

		if( expected == actual ) {
			//console.log( "Expected == actual == ", expected );
		} else {
			var newTitle = stripTitleWork( title ) + " " + expected;
			//console.log( "Expected (", expected, ") != actual (", actual, ")" );
			//console.log( "Should rename \"" + title + "\" => \"" + newTitle + "\"" );
			shouldChangeName( card, newTitle );
		}
	}

	export var onChangesMaybeDone = $.debounce( 2000, onChangesDone );
}
