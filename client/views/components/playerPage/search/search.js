// limit results and instant results
var maxResults = 20;
// minimum song length
// 120000 = 2 minutes
var minSongLength = 120000;
// maximum song length
// 600000 = 10 minutes
var maxSongLength = 600000;

SearchResults = new Meteor.Collection(null);

var processSearchResults = function(tracks, query) {
  // clear the results
  SearchResults.remove({});
  var count = 0;
  _.each(tracks, function(value, key, list) {
    if (value.streamable) {
      //Deps.nonreactive(function() {
        if (Playlist.find({id: value.id}).count()) {
          value.inPlaylist = true;
        } else {
          value.inPlaylist = false;
        }
      //});
      SearchResults.insert(value);
    }
  });
  // highlight the instant search results
  $(".search-results tbody").highlight(query.split(" "));
}

var getSearchResults = function(event) {
  var query = $(".search input[type=search]").val().trim();
  if (query) {
    SC.get("/tracks", {
      limit: maxResults,
      q: query,
      // there is a bug in the soundcloud api where the filter option
      // is ignored when there is a query option. i'm including it
      // anyway so when it's fixed it'll work
      filter: {streamable: true},
      duration: {from: minSongLength, to: maxSongLength}
    }, function(tracks) {
      processSearchResults(tracks, query);
    });
  }
}

Template.search.events({
  // make sure the api call only fires once the user is done typing
  //"keyup .search input[type=search]": _.debounce(getInstantResults, 250),
  "submit .search form": function(event) {
    event.preventDefault();
    getSearchResults(event);
  },
  "click .add-to-playlist": function(event) {
    console.log("added song to playlist");
    OJPlayer.addSongToPlaylist(this);
  }
});

Template.search.helpers({
  searchResults: function() {
    return SearchResults.find({}, {
      sort: [["inPlaylist", "desc"], ["id", "asc"]]
    });
  },
});

Template.searchResult.helpers({
  inPlaylist: function() {
    if (Playlist.find({id: this.id}).count()) {
      if (!this.inPlaylist) {
        SearchResults.update(this._id, {
          $set: {inPlaylist: true}
        });
      }
      return "in-playlist";
    }
    if (this.inPlaylist) {
      SearchResults.update(this._id, {
        $set: {inPlaylist: false}
      });
    }
    return "";
  },
});
