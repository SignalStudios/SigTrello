/*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='trello-client.d.ts'/>
///<reference path='chrome.d.ts'/>
///<reference path='mutation-observer.d.ts'/>
///<reference path='sigtrello-dom-card-window.ts'/>

module SigTrello {
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

	function error( message : string ) : void {
		//alert( message );
	}

	var spamLimitCounter = 1000; // Safety
	function spamLimit( ) : boolean {
		//return --limit < 0;
		return false;
	}

	function getBestByNameIndex< T extends NamedThing >( name : string, index : number, items : T[] ) : T {
		if( items.length > index && items[ index ].name == name )
			return items[ index ];

		var matchingName = $.grep( items, (i) => i.name == name, false );
		if( matchingName.length == 1 )
			return matchingName[ 0 ];

		return null; // Ambiguous due to move of duplicately named list item, or no such item.
	}

	function authorize( ) : void {
		Trello.authorize({
			type: "popup",
			name: "SigTrello",
			persist: true,
			interactive: true,
			scope: { read: true, write: true, account: false },
			expiration: "never"
		});
	}

	function getFlatName( $node : JQuery ) : string {
		var $elements = $node.contents( );
		var s = "";
		for( var i = 0; i < $elements.length; ++i ) {
			var element = $elements.get(i);
			if( element.nodeName == 'A' ) {
				s += $(element).attr("href");
			} else {
				s += $(element).text( );
			}
		}
		return s;
	}

	function replaceWithLink( ) : boolean {
		var toLink = this;
		if( !Trello.authorized() ) {
			authorize( );
			if( !Trello.authorized() )
				return false;
		}

		var checklistItem	= SigTrelloDom.CardWindow.ChecklistItem.ownerOf( this );
		var checklist		= checklistItem.checklist;
		var card			= checklist.card;

		var $this				= $(this);

		var $checklistItem		= $this.parent('.checklist-item');
		if( checklistItem.isAllOneUrl )
			return;
		
		$this.toggle( );
		// TODO: Learn how to tame JavaScript callback hell.
		
		// 1.  Identify the trello list
		Trello
			.get( "cards/"+card.shortId+"/list", { fields: "" } )
			.done( ( list : TrelloList ) => {

				// 2. Identify the checklist item being replaced.
				Trello
					.get( "cards/"+card.shortId+"/checklists" )
					.done( ( cardInfo : TrelloChecklist[] ) => {
						var cardChecklist = getBestByNameIndex( checklist.title, checklist.index, cardInfo );
						if( cardChecklist == null ) { error( "Checklist ambiguous or missing!" ); return; }

						var cardChecklistItem = getBestByNameIndex( checklistItem.textEntered, checklistItem.index, cardChecklist.checkItems );
						if( cardChecklistItem == null ) { error( "Checklist item ambiguous or missing!" ); return; }

						// 3.  Post new card to the list
						Trello
							.post( "lists/"+list.id+"/cards", { name: checklistItem.textDisplayed, desc: "Parent: "+card.url+" "+checklist.title, due: null } )
							.done( ( newCard : TrelloCard ) => {

								// 4.  Replace checklist item with new card
								Trello
									.put( "cards/"+card.shortId+"/checklist/"+cardChecklist.id+"/checkItem/"+cardChecklistItem.id+"/name", { value: newCard.url } );
							});
					});
			});

		return false;
	}

	var newChecklistsObserver = new MutationObserver(function(mutations) {
		var $checklistItemsList = $(".checklist-items-list .checklist-item");
		for( var i = 0; i < $checklistItemsList.length; ++i ) {
			showConvertToCardButton( $checklistItemsList.get(i) );
		}

		var $checklistEditControls = $(".checklist-item-details .edit-controls");
		if( $checklistEditControls.length > 0 ) {
			showConvertToCardLink( $checklistEditControls.get(0) );
		}
	});

	newChecklistsObserver.observe( document.body, { childList: true, characterData: false, attributes: false, subtree: true } );

	function showConvertToCardButton( location : Element ) : void {
		if($(location).find('.ctcButtonImg').length) return; // Don't double add
		if( spamLimit( ) ) return;

		// Space the checkbox farther from the linkify icon
		$(location).find( '.checklist-item-checkbox' ).css( 'left', '16px' );

		// Add clickable image to linkify checkbox
		$("<img class='ctcButtonImg checklist-item-checkbox' style='left: -12px' src='" + chrome.extension.getURL('images/link.png') + "'>")
			.appendTo( location )
			.click( replaceWithLink )
			;
	}

	function showConvertToCardLink( location : Element ) : void {
		if($(location).find('.js-convert-item-to-link').length) return; // Don't double add
		if( spamLimit( ) ) return;

		// Add link to checkbox additional options
		$("<a href='#' class='option convert js-convert-item-to-link'>Convert to Link</a>")
			.insertAfter( $(location).find('.js-delete-item').get(0) )
			.click( replaceWithLink )
			;
	}
}