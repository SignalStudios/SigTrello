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
///<reference path='sigtrello-workparse.ts'/>
///<reference path='sigtrellodom-cardwindow.ts'/>

module SigTrello {
	var enableAutomaticRenames = true;

	function sumChecklistWork( ) : IWork {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( !card || spamLimit() ) return null;

		var works = [];

		card.checklists.forEach( (checklist) => {
			checklist.items.forEach( (checkitem) => {
				var parsed = parseTitleWorkOrBadge( checkitem.textDisplayed, checkitem.element );
				if( parsed )
					works.push( parsed );
			});
		});

		return works.length > 0 ? sumWork( works ) : null;
	}

	function sumCommentWork( ) : IWork {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( !card || spamLimit() ) return null;

		var estOriginal		: number = undefined;
		var estRemaining	: number = 0.0;
		var estWorked		: number = 0.0;

		var pattern = /(work|worked|estimate|estimated)[:]?\s+([=+-])?(\d+\.?\d*|\d*\.?\d+)([wdhm])/gi;
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

	function doRename( card : SigTrelloDom.CardWindow.Card, newName : string ) {
		if( Options.current.option_developer_spamlogs )
			console.log( "Kick off rename of \"" + card.title + "\" => \"" + newName + "\"" );

		if( enableAutomaticRenames )
			Trello.put( "/card/"+card.shortId+"/name", { "value": newName } );
	}

	var lastAttemptedRenameCard : SigTrelloDom.CardWindow.Card;
	var lastAttemptedRenameName : string = "";
	var lastAttemptedRenameTime : number = 0;

	function shouldChangeName( card : SigTrelloDom.CardWindow.Card, newName : string ) {
		if( !authorize( ) ) return;
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

		var comments = sumCommentWork( );
		var checklists = sumChecklistWork( );
		var sumFound = sumWork( [ comments, checklists ] );

		var current = parseTitleWorkOrBadge( card.title, card.element );
		if( sumFound == null ) return;
		if( current == null ) return;

		var format = WorkFormat.RawTitle;
		var expected = toTrelloPoints( format, sumFound );
		var actual = toTrelloPoints( format, current );

		if( expected == actual ) {
			//console.log( "Expected == actual == ", expected );
		} else {
			$(card.element).find(".window-title-text .sigtrello-time").remove();
			var newTitle = stripTitleWork( card.title ) + " " + expected;
			//console.log( "Expected (", expected, ") != actual (", actual, ")" );
			//console.log( "Should rename \"" + title + "\" => \"" + newTitle + "\"" );
			shouldChangeName( card, newTitle );
		}
	}

	export var onChangesMaybeDone = $.debounce( 2000, onChangesDone );
}
