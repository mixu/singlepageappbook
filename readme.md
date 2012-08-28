# Single page apps in depth

Read the book here: http://singlepageappbook.com/

# Notes

I've added this repository to make it easier to work with the book, if you feel like it.

I didn't include the commits from prior to the release, because book writing is a messy and painful process of revisions, deletions and rethinking things.

I did all the writing directly as HTML inside a git repo:

    git shortlog -sn

tells me that I made 216 commits between Jun 28th 2012 and Jan 18th 2012 to write the book.

There will be a second set of updates coming later on - once I am done with http://mixu.net/view.json/ , which is a view layer I'm working on right now. It has definitely changed and clarified my thinking re:view layers. Writing a book is fairly intense, which is why I am focusing on code for now; it'll let me come back to the book with a less attached and more critical perspective.

# Directory structure

The content of the book is in ./content/. To generate the book:

    npm install
    node generate.js

which generates the output in ./output/.

To rebuild the .epub and .mobi files:

    make book.epub book.mobi

You need to install calibre first for the HTML to epub/mobi conversion.

# Licence

This book is available for free, but what I've written remains mine.

Translations: as long as the content made is available for free (you can have ads) I welcome translations.

Other use: contact me; as long as your intentions are good I'd be happy to figure out something. I'm not looking to make money from the book.
