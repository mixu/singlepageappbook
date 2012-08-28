book.mobi:
	@echo "\n... generating $@"
	ebook-convert output/single-page.html output/mixu-single-page-apps.mobi \
		--max-levels 0 \
		--chapter "//*[@class = 'chapter']" \
		--linearize-tables \
		--extra-css 'body, div, dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, pre, form, fieldset, input, p, blockquote, table, th, td, embed, object, hr { padding-left: 0 !important; padding-right: 0 !important; margin-right: 0 !important; margin-left: 0 !important; }' \
		--authors "Mikito Takada" \
		--language en \
		--output-profile kindle

book.epub:
	@echo "\n... generating $@"
	ebook-convert output/single-page.html output/mixu-single-page-apps.epub \
		--max-levels 0 \
		--chapter "//*[@class = 'chapter']" \
		--linearize-tables \
		--extra-css 'body, div, dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, pre, form, fieldset, input, p, blockquote, table, th, td, embed, object, hr { padding-left: 0 !important; padding-right: 0 !important; margin-right: 0 !important; margin-left: 0 !important; }' \
		--authors "Mikito Takada" \
		--no-default-epub-cover \
		--language en
