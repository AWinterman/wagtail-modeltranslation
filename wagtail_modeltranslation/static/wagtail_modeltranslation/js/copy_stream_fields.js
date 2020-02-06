/* Creates the copy buttons in the header of each stream field */
$(document).ready(function(){
	//All the stream fields with all his content
	var allStreamFields = $('li.stream-field');

	// Setup regex to find field name and fild lang
	var langOpts = wagtailModelTranslations.languages.join('|');
	var reExpression = "(.+)?_(" + langOpts + "){1}".replace('-', '_');
	var re = new RegExp(reExpression, "g");

	/* Iterate all stream fields, put the copy buttons in each one.*/
	for (var i = 0; i < allStreamFields.length; i++) {
		//Current Field with all content
		var currentStreamField = allStreamFields[i];
		//Current Field header
    var header;
    if(versionCompare(WAGTAIL_VERSION,'2.6.0')===-1){
      header = $(currentStreamField).children('h2')[0];
    } else {
      header = $(currentStreamField).children('.title-wrapper')[0];
    }
		//Search for the input field so that we can get is id to know the field's name.
		var streamFieldDiv = $(currentStreamField).find('div.sequence-container.sequence-type-stream')[0];
		var fieldInfos = $(streamFieldDiv).children('input')[0].id.split('-')[0];
		// extract field name and fild lang from regex, return if not match
		var match = re.exec(fieldInfos);
		if (match === null) return;
		var fieldName = match[1];
		var fieldLang = match[2];

		//The cycle to create the buttons for copy each language field
		var copyContentString = 'Copy content from';
		header.innerHTML += '<div class="translation-field-copy-wrapper">'+copyContentString+': </div>';
		for (var j = 0; j < wagtailModelTranslations.languages.length; j++) {
			currentLangCode = wagtailModelTranslations.languages[j].replace('-', '_');
			if (fieldLang != currentLangCode) {
				var currentFieldID = fieldName + '_' + fieldLang;
				var targetFieldID = fieldName + '_' + currentLangCode;
				$(header).children('.translation-field-copy-wrapper')[0].innerHTML += '<button class="button translation-field-copy" current-lang-code="'+ currentFieldID +'" data-lang-code="'+ targetFieldID +'">'+wagtailModelTranslations.languages[j]+'</button>';
			};
		};
	};

	/* on click binding */
	$('.translation-field-copy').click(function(event){
		event.preventDefault();
		var lang = $(this).attr('data-lang-code');
		var currentLang = $(this).attr('current-lang-code');
		requestCopyField(lang, currentLang);
	});
});

/* Copy the content of originID field to the targetID field */
function requestCopyField(originID, targetID) {
	/* Get the originID field and convert him to json string */
	var serializedForm = $("#page-edit-form").serializeArray();
	var serializedOriginField = $.grep(
		serializedForm,
		function(obj){
			return obj.name.indexOf(originID) >= 0;
		}
	);
	var jsonString = JSON.stringify(serializedOriginField);

	/*
	 * AJAX request that returns the html content of originID field
	 * with the id's changed to targetID
	 */
	$.ajax({
		url: 'copy_translation_content/',
		headers: { "X-CSRFToken": Cookies.get('csrftoken') },
		type: 'POST',
		dataType: 'json',
		data: {'origin_field_name': originID, 'target_field_name': targetID, 'serializedOriginField': jsonString},
	})
	.done(function(data) {
		/* Put the html data in the targetID field */
		var wrapperDiv = $("#"+targetID+"-count").parents('.input')[0];
		$(wrapperDiv).html(data);
	})
	.fail(function(error) {
		console.log("wagtail-modeltranslation error: %s", error.responseText);
	})

}
