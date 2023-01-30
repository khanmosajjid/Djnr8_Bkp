$('#AddBannerForm').on('submit',(function(e) {
    e.preventDefault();

  
    let thisBtn = $('#banner_insert');
    // AddBannerForm
    thisBtn.html(thisBtn.attr('data-loading-text')).prop('disabled', true);
    var banner_URL = $('#banner_URL').val();
   
    //var banner_img = $('#banner-img').val();
   

    if (banner_URL == '') {
        toastr["error"]('Please fill out the field!');
        thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
    } else {
        var formData = new FormData(this);

        
        console.log("form data is------>",formData)
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/insertBanner",
            "headers": {
                "Authorization": token
            },
            data: formData,
            cache:false,
            contentType: false,
            processData: false,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            error: function (xhr, status, error) {
                console.log(error);
                toastr["error"](xhr.responseJSON.message);
                thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
            }
        });
    }
}));




$(document).ready(function () {
    $('#bannerTable').DataTable({
        responsive: true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/api/v1/admin/getbanners",
            "type": "POST",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.data = json.data.data;
                json.draw = json.data.draw;
              
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [{
            "mData": "bDesktopFileHash",
            render: function (mData, type, row) {
                return `<td><img src="https://ipfs.infura.io/ipfs/${row.bDesktopFileHash}" class="bannerimage img-responsive"/></td>`;
            }
        },
        
        { 
            "mData": 'bannerURL',
        },
        {
            "mData": "_id",
            orderable: false,
            "render": function (data, type, row, meta) {
                return `
                    <a id="btnUpdateBanner" name="updated" title="Update" href='/a/editbanner/${row._id}'   class="btn btn-success btn-xs"><i class="fa fa-pencil"></i></a>
                    <button id="btnDeleteBanner" name="deleted" title="Delete" onclick="deleteBanner($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
                
            }
        }],
        "columnDefs": [{
            "searchable": false,
            "orderable": false,
        }],
        "iDisplayLength": 10
    });
    // Add placeholder in search field
    $("#bannerTable_filter > label > input[type=search]").attr("placeholder", "Collection Address")
});
function deleteBanner(btn) {
    if (confirm("Are you sure to delete this Item?")) {
        let oOptions = { sObjectId: btn.attr("objId") }
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/deleteBanner",
            data: oOptions,
            headers: {
                'Authorization': token
            },
            success: function (result, status, xhr) {
                console.log(xhr);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(function () {
                    window.location.reload();
                }, 1000)
            },
            error: function (xhr, status, error) {
                toastr["error"](xhr.responseJSON.message);
                console.log(xhr);
            }
        });
    }
    return false;
}




