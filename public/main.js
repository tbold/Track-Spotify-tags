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
            //
          } else {
            console.log(items);
            let parent = $('#badge-'+id);
            let childElement = document.createElement('ul');
            childElement.setAttribute("class", "badge badge-pill badge-outline-info");
            var badge = document.createElement("a");
            badge.setAttribute("href", "#1");

            badge.innerHTML = items;
            var pill = document.createElement("a");
            pill.setAttribute("class", "badge badge-pill");
            pill.innerHTML = "X";
            childElement.append(badge);
            childElement.append(pill);
            parent.append(childElement);
            
            // location.reload(true);
          }
      }
  });
 
  // fetch('/submit-form', {
  //   method: 'put',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
      
  //   })
  // })
}