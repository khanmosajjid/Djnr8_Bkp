$('#faqs_update').on('click', function () {

    let thisBtn = $(this);

    thisBtn.html(thisBtn.attr('data-loading-text')).prop('disabled', true);
    var sQuestion = $('#sQuestion').val().trim();
    var sAnswer = $('#sAnswer').val().trim();
    var order=$('#order').val();
    order=parseInt(order,10);
    console.log("order is--->",typeof order ,order)

    if (sQuestion == '' || sAnswer == '') {
        toastr["error"]('Please fill out all fields!');
        thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
    } else {
        let oData = {
            'sQuestion': sQuestion,
            'sAnswer': sAnswer,
            'order':parseInt(order)
        }
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/updateFAQs",
            "headers": {
                "Authorization": token
            },
            data: oData,
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
})
$('#sQuestion').on('keyup', function () {
    $('#preview_question').html(`<B>Question: </B>` + $(this).val().trim());
})
$('#sAnswer').on('keyup', function () {
    $('#preview_answer').html(`<B>Answer: </B>` + $(this).val().trim());
})


$(document).ready(function () {
    $('#allFaqTable').DataTable({
        responsive: true,
        "processing": true,
        //"serverSide": true,
        "ajax": {
            "url": "/api/v1/user/getFAQsData",
            "type": "GET",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                
                console.log("table data is---",json);
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [{
            "mData": "oFAQs_data",
            render: function (mData, type, row) {
               
                return `<td>${mData.sQuestion}</td>`;
            }
        },
        { 
            "mData": "oFAQs_data",
            render: function (mData, type, row) {
                
                return `<td>${mData.sAnswer}</td>`;
            }
        },
        {
            "mData": "oFAQs_data",
            orderable: false,
            "render": function (data, type, row, meta) {
              
                return `
                   
                    <button id="btnDeleteFaq" name="deleted" title="Delete" onclick="deleteFaq($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
                
            }
        }],
        "columnDefs": [{
            "searchable": false,
            "orderable": false,
        }],
        //"iDisplayLength": 10
    });
    // Add placeholder in search field
    $("#bannerTable_filter > label > input[type=search]").attr("placeholder", "Collection Address")
});


function deleteFaq(btn) {
    if (confirm("Are you sure to delete this Item?")) {
        let oOptions = { sObjectId: btn.attr("objId") }
      
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/deleteFAQs",
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
