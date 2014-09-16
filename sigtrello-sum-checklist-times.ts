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

			checklist.items.forEach( (item) => {
				var includeLinks = false;
				var itemText = includeLinks ? item.textDisplayed : item.textEntered;
				var itemRounds = itemText.match( reRound );
				var itemSquares = itemText.match( reSquare );

				if( itemRounds != null ) {
					round  += parseFloat( itemRounds[1] );
					anyRound = true;
				}

				if( itemSquares != null ) {
					square += parseFloat( itemSquares[1] );
					anySquare = true;
				}
			});

			if( anyRound  && checklist.displayTitle.match( reRound  ) == null ) checklist.displayTitle += " (0)";
			if( anySquare && checklist.displayTitle.match( reSquare ) == null ) checklist.displayTitle += " [0]";

			checklist.displayTitle = checklist.displayTitle
				.replace( reRound, "("+round.toString()+")" )
				.replace( reSquare, "["+square.toString()+"]" )
				;
		});
	}
}
 