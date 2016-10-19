var lunr = require('./bower_components/lunr.js/lunr.js'),
  fs = require('fs')
require('./bower_components/lunr-languages/lunr.stemmer.support.js')(lunr);
require('./bower_components/lunr-languages/lunr.fr.js')(lunr);

var idx = lunr(function () {
  this.ref('id')
  this.use(lunr.fr);
  this.field('title', { boost: 10 })
  this.field('category', { boost: 100 })
  this.field('body')
})

fs.readFile('./data.fr.json', function (err, data) {
  if (err) throw err

  var raw = JSON.parse(data)

  var tutorials = raw.tutorials.map(function (q) {
    return {
      id: q.id,
      title: q.title,
      body: q.body,
      category: q.category
    }
  })

  tutorials.forEach(function (tutorial) {
    idx.add(tutorial)
  })

  fs.writeFile('./index.fr.json', JSON.stringify(idx), function (err) {
    if (err) throw err
    console.log('done')
  })
})
