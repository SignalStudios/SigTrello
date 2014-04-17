/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

// TODO:
//	Debounce
//	Rewrite in TypeScript ?

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

var limit = 1000; // Safety

//Trello.deauthorize();

function error( message ) {
	//alert( message );
}

function getBestByNameIndex( name, index, items ) {
	if( items.length > index && items[ index ].name == name )
		return items[ index ];

	var matchingName = $.grep( items, function(i) { return i.name == name });
	if( matchingName.length == 1 )
		return matchingName[ 0 ];
	
	return null; // Ambiguous due to move of duplicately named list item, or no such item.
}

function authorize( ) {
	Trello.authorize({
		type: "popup",
		name: "SigTrello",
		persist: true,
		interactive: true,
		scope: { read: true, write: true, account: false },
		expiration: "never"
	});
}

function replaceWithLink( ) {
	var toLink = this;
	if( !Trello.authorized() ) {
		authorize( );
		if( !Trello.authorized() )
			return;
	}

	var $this				= $(this);

	var $checklistItem		= $this.parent('.checklist-item');
	var $checklistItemText 	= $checklistItem.find('.checklist-item-details-text')
	var hasLinks			= $checklistItemText.find('a').length > 0;
	if( hasLinks )
		return;

	var baseURI				= window.document.baseURI;
	var cardShortId			= baseURI.replace( /^http[s]?:\/\/trello.com\/c\/([^\/]+)\/.*/, "$1" ); // Parse "mbdChsJG" out of "https://trello.com/c/mbdChsJG/185-test"
	var $checklistItemsList	= $checklistItem.parent('.checklist-items-list');
	var $checklist			= $checklistItemsList.parent('.checklist');
	var $checklistList		= $checklist.parent('.checklist-list');
	
	var checklistItemTitle	= $checklistItemText.text( );
	var checklistItemIndex	= $checklistItemsList.find('.checklist-item').index($checklistItem);
	var checklistTitle		= $checklist.find('.checklist-title h3').text( );
	var checklistIndex		= $checklistList.find('.checklist').index($checklist);
	
	// TODO: Learn how to tame JavaScript callback hell.
	
	// 1.  Identify the trello list
	Trello
        .get( "cards/"+cardShortId+"/list", { fields: "" } )
        .done( function( list ) {

			// 2. Identify the checklist item being replaced.
			Trello
				.get( "cards/"+cardShortId+"/checklists" )
				.done( function( cardInfo ) {
					var cardChecklist = getBestByNameIndex( checklistTitle, checklistIndex, cardInfo );
					if( cardChecklist == null ) { error( "Checklist ambiguous or missing!" ); return; }

					var cardChecklistItem = getBestByNameIndex( checklistItemTitle, checklistItemIndex, cardChecklist.checkItems );
					if( cardChecklistItem == null ) { error( "Checklist item ambiguous or missing!" ); return; }

					// 3.  Post new card to the list
					Trello
						.post( "lists/"+list.id+"/cards", { name: checklistItemTitle, desc: "Parent: "+baseURI+" "+checklistTitle, due: null } )
						.done( function( newCard ) {

							// 4.  Replace checklist item with new card
							Trello
								.put( "cards/"+cardShortId+"/checklist/"+cardChecklist.id+"/checkItem/"+cardChecklistItem.id+"/name", { value: newCard.url } );
						});
				});
		});

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
		.click( replaceWithLink )
		;
}

function showConvertToCardLink(location) {
	if($(location).find('.js-convert-item-to-link').length) return; // Don't double add
	if( --limit < 0 ) return;

	// Add link to checkbox additional options
	$("<a href='#' class='option convert js-convert-item-to-link'>Convert to Link</a>")
		.insertAfter( $(location).find('.js-delete-item').get(0) )
		.click( replaceWithLink )
		;
}
