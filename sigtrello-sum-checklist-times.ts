/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='sigtrellodom-cardwindow.ts'/>

module SigTrello {
	var reRound = /\((\d+)\)/;
	var reSquare = /\[(\d+)\]/;

	export function sumChecklistTimes( ) {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( !card || spamLimit( ) ) return;

		var checklists = SigTrelloDom.CardWindow.Card.current.checklists;
		checklists.forEach( (checklist) => {
			var round	= 0.0;
			var square	= 0.0;

			var anyRound = false;
			var anySquare = false;

			var works = [];
			checklist.items.forEach( (item) => {
				var includeLinks = false;
				var itemText = includeLinks ? item.textDisplayed : item.textEntered;
				var work = parseTitleWorkOrBadge( itemText, item.element );
				if( work )
					works.push( work );
			});

			var work = sumWork( works );
			var currentWork = parseTitleWorkOrBadge( checklist.displayTitle, checklist.element );
			if( work && currentWork && !equalWork( work, currentWork ) ) {
				checklist.displayTitle = stripTitleWork( checklist.displayTitle ) + " " + toTrelloPoints( WorkFormat.RawTitle, work );
			}
		});
	}
}
 