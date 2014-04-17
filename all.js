/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

// TODO:
//	Debounce

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

var limit = 1000; // Safety

function addCardToList( $list, title, onSuccess, onFailure ) {
	var editedCard = false;
	var addedCard = false;
	var calledCallback = false;
	var originalLastCardUrl = $list.find('.list-card').last().find('a').attr('href');

	var newCardsObserver = new MutationObserver( function(mutations) {
		if( !editedCard ) {
			var $listCardComposerTextArea = $list.find('.list-card-composer-textarea');
			if( $listCardComposerTextArea.length > 0 ) {
				$listCardComposerTextArea.prop( 'value', title );
				editedCard = true;
			}
			else
				return;
		}
		
		if( !addedCard ) {
			var $add = $list.find('.js-add-card');
			if( $add.length > 0 ) {
				$add.get(0).click();
				addedCard = true;
			}
			else
				return;
		}
		
		if( !calledCallback ) {
			var lastCardUrl = $list.find('.list-card a').last().attr('href');
			if( originalLastCardUrl != lastCardUrl ) {
				newCardsObserver.disconnect( );
				var $rem = $list.find('.js-cancel');
				$rem.get(0).click();
				onSuccess( lastCardUrl );
				calledCallback = true;
			}
			else
				return;
		}
	});
	newCardsObserver.observe( $list.get(0), { childList: true, attributes: true, subtree: true } );
	
	var $openCardComposer = $list.find('.open-card-composer');
	$openCardComposer.get(0).click();
}

function displayChecklistInformation( ) {
	var $checklistItem		= $(this).parent('.checklist-item');
	var $checklistItemsList	= $checklistItem.parent('.checklist-items-list');
	var $checklist			= $checklistItemsList.parent('.checklist');
	var $checklistList		= $checklist.parent('.checklist-list');
	var $window				= $checklistList.parents('.window');
	var baseURI				= $window.get(0).baseURI.replace( /^http[s]?:\/\/trello.com/, "" );
	
	var $card			= $(".list-area a[href='"+baseURI+"']").parents('.list-card');
	var $list			= $card.parents('.list');
	var $lists			= $card.parents('.list-area');
	
	var hasLinks	= $checklistItem.find('.checklist-item-details-text a').length > 0;
	var title		= $checklistItem.find('.checklist-item-details-text').text( );
	var chkItemNum	= $checklistItemsList.find('.checklist-item').index($checklistItem);
	var chkListNum	= $checklistList.find('.checklist').index($checklist);
	var cardNum		= $list.find('.list-card').index($card);
	var listNum		= $lists.find('.list').index($list);
	
	addCardToList( $list, title, function( newCardUrl ) { alert( "Added new card @ " + newCardUrl ); } );
	//alert( "Checklist " + listNum + "." + cardNum + "." + chkListNum + "." + chkItemNum + "\n" + title + "\n" + baseURI );
	
	return false;
}

var newChecklistsObserver = new MutationObserver(function(mutations) {
	$checklistItemsList = $(".checklist-items-list .checklist-item");
	for( var i = 0; i < $checklistItemsList.length; ++i ) {
		showConvertToCardButton( $checklistItemsList.get(i) );
	}

    $checklistEditControls = $(".checklist-item-details .edit-controls");
    if( $checklistEditControls.length > 0 ) {
        showConvertToCardLink( $checklistEditControls.get(0) );
    }
});

newChecklistsObserver.observe( document.body, { childList: true, characterData: false, attributes: false, subtree: true } );

function showConvertToCardButton(location) {
	if($(location).find('.ctcButtonImg').length) return; // Don't double add
	if( --limit < 0 ) return;
	
	// Space the checkbox farther from the linkify icon
	$(location).find( '.checklist-item-checkbox' ).css( 'left', '16px' );
	
	// Add clickable image to linkify checkbox
	$("<img class='ctcButtonImg checklist-item-checkbox' style='left: -12px' src='" + chrome.extension.getURL('images/link.png') + "'>")
		.appendTo( location )
		.click( displayChecklistInformation )
		;
}

function showConvertToCardLink(location) {
	if($(location).find('.js-convert-item-to-link').length) return; // Don't double add
	if( --limit < 0 ) return;
	
	// Add link to checkbox additional options
	$("<a href='#' class='option convert js-convert-item-to-link'>Convert to Link</a>")
		.insertAfter( $(location).find('.js-delete-item').get(0) )
		.click( displayChecklistInformation )
		;
}
