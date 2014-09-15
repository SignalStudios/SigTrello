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

module SigTrello {
	function onChangesImpl( ) {
		var $checklistItemsList = $(".checklist-items-list .checklist-item");
		for( var i = 0; i < $checklistItemsList.length; ++i ) {
			showConvertToCardButton( $checklistItemsList.get(i) );
		}

		var $checklistEditControls = $(".checklist-item-details .edit-controls");
		if( $checklistEditControls.length > 0 ) {
			showConvertToCardLink( $checklistEditControls.get(0) );
		}

		var $listControls = $(".list");
		for( var i = 0; i < $listControls.length; ++i ) {
			showCollapseListLink( $listControls.get(i) );
		}
	}

	var onChanges = $.throttle( 200, onChangesImpl );

	var bodyChildrenObserver = new MutationObserver( function(mutations) {
		onChanges( );
		onChangesMaybeDone( );
	});

	bodyChildrenObserver.observe( document.body, { childList: true, characterData: false, attributes: false, subtree: true } );
}
