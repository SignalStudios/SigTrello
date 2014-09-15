/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrellodom-boardwindow.ts'/>

module SigTrello {
	function toPercentage( n : number, total : number ) {
		if( total == 0.0 )
			return "100";
		else
			return (n*100/total).toFixed(0);
	}

	export function showTitleWorkBadges( ) : void {
		var board = SigTrelloDom.BoardWindow.Board.current;
		if( !board || spamLimit( ) ) return;

		board.lists.forEach( (list) => {
			list.cards.forEach( (card) => {
				if( card.badges.filter( badge => badge.isPoints ).length > 0 ) return; // Don't double add

				var work = parseTitleWork( card.displayName );
				var newDisplayName = stripTitleWork( card.displayName );
				if( newDisplayName != card.displayName )
				{
					console.log( "Hiding display name:", card.displayName, "=>", newDisplayName );
					card.displayName = newDisplayName;

					var titleFormat = WorkFormat.Badge_LongDescription;
					var badgeFormat = WorkFormat.Badge_WorkOfCurrent;

					var perc = toPercentage( work.worked, work.remaining + work.worked );

					var newBadge = $("<div class=\"badge\"></div>")
						.prop( "title", toTrelloPoints( titleFormat, work ) )
						.attr( "style", "border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 "+perc+"%, #000000 "+perc+"%)" )
						.addClass( isWorkComplete( work ) ? "badge-state-complete" : "" )
						.append( $("<span class=\"badge-icon icon-sm icon-clock\" style=\"color: white;\"></span>") )
						.append( $("<span class=\"badge-text\"></span>")
							.text( toTrelloPoints( badgeFormat, work ) )
							.prop( "sigtrello-work", work )
						);
					card.addBadge( newBadge );
				}
			});
		});
	}
}
