"use strict";

$(function () {

    var getBooks = function (readRSS) {
        var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from rss where url=\"' + encodeURIComponent(readRSS) + '\"&format=json';
        $.get(url, function (data) {
            //console.log(data.query.results.item);
            $(data.query.results.item).each(function (index) {
                console.log(this.book_large_image_url);
                var img = document.createElement("img");
                img.setAttribute("src", this.book_large_image_url);
                img.setAttribute("alt", this.title);
                $("#results").append(img);
            });
        });

    }

    $("#frmRead").submit(function (event) {
        if (typeof (Storage) !== "undefined") {
            var readRSS = $("#txtRead").val();
            localStorage.setItem("readRSS", readRSS);
            getBooks(readRSS);
        }
        else {
            alert("Sorry, your browser doesn't support local storage and therefore we can't help you.")
        }
        event.preventDefault();
    })

    var readRSS = localStorage.getItem("readRSS");
    if (readRSS) {
        getBooks(readRSS);
    };

});