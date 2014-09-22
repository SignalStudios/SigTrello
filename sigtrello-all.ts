/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='jquery-ba-throttle-debounce.d.ts'/>
///<reference path='sigtrello-checklist2cards.ts'/>
///<reference path='sigtrello-collapselists.ts'/>
///<reference path='sigtrello-options.ts'/>

module SigTrello {
	function onChangesImpl( ) {
		if( Options.current.option_display_checklist2cards_enable ) {
			var $checklistItemsList = $(".checklist-items-list .checklist-item");
			for( var i = 0; i < $checklistItemsList.length; ++i ) {
				showConvertToCardButton( $checklistItemsList.get(i) );
			}

			var $checklistEditControls = $(".checklist-item-details .edit-controls");
			if( $checklistEditControls.length > 0 ) {
				showConvertToCardLink( $checklistEditControls.get(0) );
			}
		}

		if( Options.current.option_display_listcollapse_enable ) {
			var $listControls = $(".list");
			for( var i = 0; i < $listControls.length; ++i ) {
				showCollapseListLink( $listControls.get(i) );
			}
		}

		if( Options.current.option_actions_worksum_enable ) {
			sumChecklistTimes( );
		}

		if( Options.current.option_display_p4weblinks_enable ) {
			var p4web = Options.current.option_display_p4web_rooturl;
			if( p4web ) {
				var changelistIcon = p4web + "/submittedChangelistIcon?ac=20";
				var changelistUrlPattern = p4web + "/$1?ac=10";
				var changelistDescPattern = "$1";
				replaceWithServiceLinks( /(?:CL|Changelist)[ ]*[#]?[ ]*(\d+)/i, changelistIcon, changelistUrlPattern, changelistDescPattern );
			}
		}

		if( Options.current.option_display_workbadge_enable ) {
			showTitleWorkBadges( );
		}
	}

	var onChanges = $.throttle( 200, onChangesImpl );

	var bodyChildrenObserver = new MutationObserver( function(mutations) {
		onChanges( );
		onChangesMaybeDone( );
	});

	export function main() {
		bodyChildrenObserver.observe( document.body, { childList: true, characterData: false, attributes: false, subtree: true } );
	}
}
