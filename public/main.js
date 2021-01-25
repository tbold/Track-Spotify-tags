function onClick(id){
  let items = $('#add-form-'+id).val();
  console.log(items);
  console.log(id);
  $.ajax({
      url: "submit-form",
      type: "PUT",
      data: {
        spotify_id: id,
        tag: items
      },
      success: function(data) {   
        if (data.error) {
          // redirect to error page
        } else {
          let parent = $('#badge-'+id);
          parent.empty();
          // let children = $('#badge-'+id +' > ul').length;
          for (let i = 0; i < data.tags.length; i++) {
            let childElement = document.createElement('ul');
            childElement.className = "badge badge-pill badge-outline-info";
  
            // each tag has 2 <a> elements
            // 1. badge class
            var badge = document.createElement("a");
            badge.href = "#1";
            badge.id = "tag-"+id+"-"+i;
            badge.innerHTML = data.tags[i];
  
            // 2. pill class
            var pill = document.createElement("a");
            pill.className = "badge badge-pill";
            pill.setAttribute("onclick", "onDelete('"+id+"','"+i+"')");
            pill.href = "#";
            pill.innerHTML = "X";
  
            childElement.append(badge);
            childElement.append(pill);
            parent.append(childElement);
            // add whitespace to make it look nicer
            parent.append("  ");
          }
          
          }
      }
  });
}

function onDelete(id, number){
  let tag = $('#tag-'+id+"-"+number).text();
  $.ajax({
    url: "delete-tag",
    type: "DELETE",
    data: {
      spotify_id: id,
      tag: tag
    },
    success: function(data) {   
      if (data.error) {
        // redirect to error page

      } else {
        // rempve parent completely
        let parent = $('#tag-'+id+"-"+number).parent();
        parent.remove();
      }
    }
});
}