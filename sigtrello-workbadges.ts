/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='sigtrello-debug.ts'/>
///<reference path='sigtrello-workparse.ts'/>
///<reference path='sigtrellodom-boardwindow.ts'/>

module SigTrello {
	var convertToBadges = true;

	function toPercentage( n : number, total : number ) {
		if( total == 0.0 )
			return "100";
		else
			return (n*100/total).toFixed(0);
	}

	export function showTitleWorkBadges( ) : void {
		if( !convertToBadges ) return;

		board_showCardWorkBadges( );
		card_showChecklistWorkBadges( );
	}

	function createCardBadge( work : IWork ) : JQuery {
		var titleFormat = WorkFormat.Badge_LongDescription;
		var badgeFormat = WorkFormat.Badge_WorkOfCurrent;

		var perc = toPercentage( work.worked, work.remaining + work.worked );

		return $("<div class=\"sigtrello-time badge\"></div>")
			.attr( "title", toTrelloPoints( titleFormat, work ) )
			.attr( "style", "border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 "+perc+"%, #000000 "+perc+"%)" )
			.addClass( isWorkComplete( work ) ? "badge-state-complete" : "" )
			.append( $("<span class=\"badge-icon icon-sm icon-clock\" style=\"color: white;\"></span>") )
			.append( $("<span class=\"badge-text\"></span>").text( toTrelloPoints( badgeFormat, work ) ) )
			.data( 'sigtrello-work', work )
			;
	}

	function createChecklistBadge( work : IWork ) : JQuery {
		var titleFormat = WorkFormat.Badge_LongDescription;
		var textFormat = WorkFormat[Options.current.option_display_workbadge_text];

		var perc = toPercentage( work.worked, work.remaining + work.worked );

		return $("<span class=\"sigtrello-time\" style=\"\"></div>")
			.attr( "title", toTrelloPoints( titleFormat, work ) )
			.attr( "style", "padding: 0px 3px 0px 0px; margin: 0px -4px 0px 4px; display: inline-block; text-decoration-line: initial; border-radius: 3px; color: white; background: linear-gradient(to right, #24a828 "+perc+"%, #000000 "+perc+"%)" )
			.addClass( isWorkComplete( work ) ? "badge-state-complete" : "" )
			.append( $("<span class=\"icon-sm icon-clock\" style=\"color: white;\"></span>") )
			.append( $("<span class=\"\"></span>").text( toTrelloPoints( textFormat, work ) ) )
			.data( 'sigtrello-work', work )
			;
	}

	function element_replaceWithFakeBadges( node : Node ) : void {
		if( node.nodeType == Node.TEXT_NODE ) {
			var work		= parseTitleWork( node.textContent );
			var newTitle	= stripTitleWork( node.textContent );

			if( node.textContent != newTitle ) {
				$(node.parentNode).remove( ".badge" );
				var badge = createChecklistBadge( work );
				$(node.parentNode).append( badge );
				node.textContent = newTitle;
			}
		} else {
			var children = node.childNodes;
			for( var i = 0; i < children.length; ++i )
				element_replaceWithFakeBadges( children[i] );
		}
	}

	function board_showCardWorkBadges( ) {
		var board = SigTrelloDom.BoardWindow.Board.current;
		if( !board || spamLimit( ) ) return;

		board.lists.forEach( (list) => {
			list.cards.forEach( (card) => {
				var work = parseTitleWork( card.displayName );
				var newDisplayName = stripTitleWork( card.displayName );
				if( newDisplayName != card.displayName )
				{
					card.displayName = newDisplayName;
					card.badges.forEach( (badge) => { if( badge.isTimeEst ) card.removeBadge( badge ); } );
					card.addBadge( createCardBadge( work ) );
				}
			});
		});
	}

	function card_showChecklistWorkBadges( ) : void {
		var card = SigTrelloDom.CardWindow.Card.current;
		if( !card || spamLimit( ) ) return;

		card.checklists.forEach( (checklist) => {
			checklist.items.forEach( (checkitem) => {
				element_replaceWithFakeBadges( $(checkitem.element).find('.checklist-item-details-text')[0] );
			});
			element_replaceWithFakeBadges( $(checklist.element).find('.checklist-title h3')[0] );
		});
		element_replaceWithFakeBadges( $(".window-title-text")[0] );
	}
}
