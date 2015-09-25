book: concat
	generate-md \
	--layout ./layout \
	--input ./input \
	--output ./output

.PHONY: book

concat:
	rm -rf ./tmp || true
	mkdir ./tmp
	cat input/index.md > ./tmp/single.md
	cat input/goal.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/maintainability1.md | bin/remove-meta.js>> ./tmp/single.md
	cat input/maintainability2.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/maintainability3.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/detail1.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/detail2.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/collections1.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/collections2.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/collections3.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/collections4.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/collections5.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/views1.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/views2.md | bin/remove-meta.js >> ./tmp/single.md
	cat input/views3.md | bin/remove-meta.js >> ./tmp/single.md
	generate-md \
	--input ./tmp/single.md \
	--layout ./layout \
	--output ./output
	cp ./output/single.html ./output/single-page.html

.PHONY: concat

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

.PHONY: book.mobi

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

.PHONY: book.epub

upload:
	aws s3 sync ./output/ s3://singlepageappbook.com/ \
	--region us-west-1 \
	--delete \
	--exclude "node_modules/*" \
	--exclude ".git"

.PHONY: upload
