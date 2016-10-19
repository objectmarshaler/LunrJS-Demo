require([
  '../bower_components/jquery/dist/jquery.js',
  '../bower_components/mustache.js/mustache.js',
  '../bower_components/lunr.js/lunr.js',
  '../bower_components/lunr-languages/lunr.stemmer.support.js',
  '../bower_components/lunr-languages/lunr.fr.js',
  '../bower_components/text/text!../templates/tutorial_view.mustache',
  '../bower_components/text/text!../templates/tutorial_list.mustache',
  '../bower_components/text/text!data.json',
  '../bower_components/text/text!index.json'
], function (_, Mustache, lunr, stemmerSupport, fr, tutorialView, tutorialList, data, indexDump) {
    stemmerSupport(lunr); // adds lunr.stemmerSupport
    fr(lunr); // adds lunr.fr key
    lunr(function () {
        // use the language (fr)
        this.use(lunr.fr);
    });
    var renderTutorialList = function (qs) {
        $("#tutorial-list-container")
        .empty()
        .append(Mustache.to_html(tutorialList, { tutorials: qs }))
    }

    var renderTutorialView = function (tutorial) {
        var contentDom = $(Mustache.to_html(tutorialView, tutorial));
        contentDom.find('script').remove();
        $("#tutorial-view-container")
        .empty()
        .append(contentDom);
    }

    window.profile = function (term) {
        console.profile('search')
        idx.search(term)
        console.profileEnd('search')
    }

    window.search = function (term) {
        console.time('search')
        idx.search(term)
        console.timeEnd('search')
    }

    var indexDump = JSON.parse(indexDump);
    console.time('load');
    window.idx = lunr.Index.load(indexDump);
    console.timeEnd('load');

    var tutorials = JSON.parse(data).tutorials.map(function (raw) {
        return {
            id: raw.id,
            title: raw.title,
            body: raw.body,
            category: raw.category
        }
    })

    renderTutorialList(tutorials)
    renderTutorialView(tutorials[0])

    $('a.all').bind('click', function () {
        renderTutorialList(tutorials)
        $('input').val('')
    })

    var debounce = function (fn) {
        var timeout
        return function () {
            var args = Array.prototype.slice.call(arguments),
                ctx = this

            clearTimeout(timeout)
            timeout = setTimeout(function () {
                fn.apply(ctx, args)
            }, 100)
        }
    }

    $('input').bind('keyup', debounce(function () {
        if ($(this).val() < 2) return
        var query = $(this).val()
        var results = idx.search(query).map(function (result) {
            return tutorials.filter(function (q) { return q.id === result.ref })[0]
        })

        renderTutorialList(results)
    }))

    $("#tutorial-list-container").delegate('li', 'click', function () {
        var li = $(this)
        var id = li.data('tutorial-id')

        renderTutorialView(tutorials.filter(function (tutorial) {
            return (tutorial.id == id)
        })[0])
    })

})
