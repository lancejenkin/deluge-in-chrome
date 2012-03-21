/*
 * This is a generalised search for torrent links.
 */

function show_download_icon() {
  var links = [];
  var magnet_links = [];
  // Find any anchor links that mention torrents.
  $('a[href*=torrent], a:contains(torrent)').each(function(i) {
    if(this === undefined) {
      return false;
    }

    // Now check that the link contains either .torrent or download, get, etc...
    if(this.href.search(/\/(download|get)\//) > 0 || this.href.search(/\.torrent$/) > 0) {
      links.push(this);
    }
  });

  // Find any anchor links that mention magnets.
  $("a[href^=magnet]").each(function(i){
    if(this === undefined){
      return false;
    }

    magnet_links.push(this);
  });

  // For all the found links, add the little download icon.
  var icon = chrome.extension.getURL('images/icons/16.png');
  var icon_added = chrome.extension.getURL('images/icons/16_green.png');

  for(var i = 0; i < links.length; i++) {
    // Check we don't already have the icon.
    if($(links[i]).next('.deluge-icon').length > 0) {
      continue;
    }
    $(links[i]).after('<a class="deluge-icon" title="Download in Deluge!" href="' + links[i].href + '"><img src="' + icon + '" alt="Download in Deluge" style="border:0;" /></a>');
  }

  // For all magnetic links, add the little magnet icon
  var magnet_icon = chrome.extension.getURL('images/icons/magnet_16.png');
  var magnet_icon_added = chrome.extension.getURL('images/icons/magnet_16_green.png');

  for(var i = 0; i < magnet_links.length; i++){
    // Check if the icon has already been added
    if ($(magnet_links[i]).next(".deluge-magnet-icon").length > 0){
      continue;
    }

    $(magnet_links[i]).after('<a class="deluge-magnet-icon" title="Download in Deluge!" href="' + magnet_links[i].href + '"><img src="' + magnet_icon + '" alt="Download in Deluge" style="border:0;" /></a>');

  }

  // For all the new Deluge download links we need to send a message to the main
  // extension to perform the adding action (see background.html).
  $('.deluge-icon, .deluge-magnet-icon').live('click', function() {
    var link = this;
    chrome.extension.sendRequest({ msg: 'add_torrent_from_url', url: this.href},
    function(response) {
      if(response.msg == 'success') {
        if(link.href.indexOf("magnet:") == 0){
          $('img', link).attr('src', magnet_icon_added);
        }else{
          $('img', link).attr('src', icon_added);
        }
      } else {
        console.log('deluge: failed to download torrent file.');
      }
    });
    return false;
  });

  
}



chrome.extension.sendRequest({msg: 'enable_download_icon'}, function(response) {
  console.log(response);

  if(response == 'true') {
    show_download_icon();
  }
});