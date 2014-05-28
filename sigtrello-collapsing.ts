/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='all.ts'/>

module SigTrello {
	module CollapseState {
		var lsId = "sigtrello-collapse-state-1";
		var collapseState = {};

		if( localStorage[lsId] )
			collapseState = JSON.parse( localStorage[lsId] );

		function setCollapsedByName( board : string, list : string, collapsed : boolean ) {
			collapseState[board] = collapseState[board] || {};
			collapseState[board][list] = collapsed;
			localStorage[lsId] = JSON.stringify( collapseState );
		}

		function isCollapsedByName( board : string, list : string ) {
			return collapseState && collapseState[board] && collapseState[board][list];
		}

		export function setCollapsed( $list : JQuery, collapsed : boolean ) {
			var boardName = $list.find('.board-header-btn-text').text().trim();
			var listName = $list.find('.list-header-name').text().trim();
			setCollapsedByName( boardName, listName, collapsed );
		}

		export function isCollapsed( $list : JQuery ) {
			var boardName = $list.find('.board-header-btn-text').text().trim();
			var listName = $list.find('.list-header-name').text().trim();
			return isCollapsedByName( boardName, listName );
		}
	}

	function toggleListCollapse( ) : boolean {
		var $list = $(this).parents('.list');
		$list.toggleClass('sigtrello-collapsed-list');
		CollapseState.setCollapsed( $list, $list.hasClass('sigtrello-collapsed-list') );
		return true;
	}

	export function showCollapseListLink( location : Element ) : void {
		var $list = $(location);
		if( $list.find('.sigtrello-icon-collapse').length) return; // Don't double add
		if( spamLimit( ) ) return;

		// Add link to list collapse toggle
		$("<a href='#' class='list-header-menu-icon icon-sm sigtrello-icon-collapse dark-hover'></a>")
			.insertAfter( $(location).find('.icon-menu').get(0) )
			.click( toggleListCollapse )
			;

		if( CollapseState.isCollapsed( $list ) )
			$list.addClass('sigtrello-collapsed-list');
	}
}
